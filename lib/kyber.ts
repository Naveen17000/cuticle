export interface KyberKeyPair {
  publicKey: Uint8Array
  privateKey: Uint8Array
}

export interface EncryptedMessage {
  ciphertext: string
  sharedSecret: string
  encapsulatedKey: string
}

export interface DecryptedMessage {
  plaintext: string
}

/**
 * Generate a new ECDH key pair for a user (replacing Kyber with Web Crypto)
 * @returns Promise resolving to public and private keys
 */
export async function generateKeyPair(): Promise<KyberKeyPair> {
  try {
    console.log("[v0] Generating new encryption key pair...")

    // Generate ECDH key pair using Web Crypto API
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-384",
      },
      true,
      ["deriveKey", "deriveBits"],
    )

    // Export keys to raw format
    const publicKeyRaw = await crypto.subtle.exportKey("spki", keyPair.publicKey)
    const privateKeyRaw = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey)

    return {
      publicKey: new Uint8Array(publicKeyRaw),
      privateKey: new Uint8Array(privateKeyRaw),
    }
  } catch (error) {
    console.error("[v0] Key generation failed:", error)
    throw new Error("Failed to generate encryption key pair")
  }
}

/**
 * Encrypt a message using recipient's public key
 * @param message - Plain text message to encrypt
 * @param recipientPublicKey - Recipient's public key
 * @returns Encrypted message with shared secret and encapsulated key
 */
export async function encryptMessage(message: string, recipientPublicKey: Uint8Array): Promise<EncryptedMessage> {
  try {
    // Generate ephemeral key pair for this encryption
    const ephemeralKeyPair = await crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-384",
      },
      true,
      ["deriveKey", "deriveBits"],
    )

    // Import recipient's public key
    const recipientKey = await crypto.subtle.importKey(
      "spki",
      recipientPublicKey,
      {
        name: "ECDH",
        namedCurve: "P-384",
      },
      false,
      [],
    )

    // Derive shared secret using ECDH
    const sharedSecret = await crypto.subtle.deriveKey(
      {
        name: "ECDH",
        public: recipientKey,
      },
      ephemeralKeyPair.privateKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt"],
    )

    // Encrypt the message with AES-GCM
    const encoder = new TextEncoder()
    const messageBytes = encoder.encode(message)
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encryptedContent = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      sharedSecret,
      messageBytes,
    )

    // Combine IV and encrypted content
    const combined = new Uint8Array(iv.length + encryptedContent.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encryptedContent), iv.length)

    // Export ephemeral public key (this is the "encapsulated key")
    const ephemeralPublicKeyRaw = await crypto.subtle.exportKey("spki", ephemeralKeyPair.publicKey)

    // Export shared secret for storage
    const sharedSecretRaw = await crypto.subtle.exportKey("raw", sharedSecret)

    return {
      ciphertext: arrayBufferToBase64(combined),
      sharedSecret: arrayBufferToBase64(sharedSecretRaw),
      encapsulatedKey: arrayBufferToBase64(ephemeralPublicKeyRaw),
    }
  } catch (error) {
    console.error("[v0] Message encryption failed:", error)
    throw new Error("Failed to encrypt message")
  }
}

/**
 * Decrypt a message using recipient's private key
 * @param encryptedMessage - Encrypted message object
 * @param privateKey - Recipient's private key
 * @returns Decrypted plain text message
 */
export async function decryptMessage(
  encryptedMessage: EncryptedMessage,
  privateKey: Uint8Array,
): Promise<DecryptedMessage> {
  try {
    // Import our private key
    const privateKeyObj = await crypto.subtle.importKey(
      "pkcs8",
      privateKey,
      {
        name: "ECDH",
        namedCurve: "P-384",
      },
      false,
      ["deriveKey", "deriveBits"],
    )

    // Import ephemeral public key
    const ephemeralPublicKeyRaw = base64ToArrayBuffer(encryptedMessage.encapsulatedKey)
    const ephemeralPublicKey = await crypto.subtle.importKey(
      "spki",
      ephemeralPublicKeyRaw,
      {
        name: "ECDH",
        namedCurve: "P-384",
      },
      false,
      [],
    )

    // Derive the same shared secret
    const sharedSecret = await crypto.subtle.deriveKey(
      {
        name: "ECDH",
        public: ephemeralPublicKey,
      },
      privateKeyObj,
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["decrypt"],
    )

    // Extract IV and ciphertext
    const combined = base64ToArrayBuffer(encryptedMessage.ciphertext)
    const iv = combined.slice(0, 12)
    const ciphertext = combined.slice(12)

    // Decrypt the message
    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      sharedSecret,
      ciphertext,
    )

    // Convert to string
    const decoder = new TextDecoder()
    const plaintext = decoder.decode(decryptedContent)

    return { plaintext }
  } catch (error) {
    console.error("[v0] Message decryption failed:", error)
    throw new Error("Failed to decrypt message")
  }
}

/**
 * Store key pair securely in browser storage
 * @param userId - User's unique identifier
 * @param keyPair - Key pair to store
 */
export function storeKeyPair(userId: string, keyPair: KyberKeyPair): void {
  try {
    localStorage.setItem(
      `encryption_keys_${userId}`,
      JSON.stringify({
        publicKey: arrayBufferToBase64(keyPair.publicKey),
        privateKey: arrayBufferToBase64(keyPair.privateKey),
      }),
    )
  } catch (error) {
    console.error("[v0] Failed to store key pair:", error)
    throw new Error("Failed to store encryption keys")
  }
}

/**
 * Retrieve stored key pair from browser storage
 * @param userId - User's unique identifier
 * @returns Stored key pair or null if not found
 */
export function getStoredKeyPair(userId: string): KyberKeyPair | null {
  try {
    const stored = localStorage.getItem(`encryption_keys_${userId}`)
    if (!stored) return null

    const parsed = JSON.parse(stored)
    return {
      publicKey: base64ToArrayBuffer(parsed.publicKey),
      privateKey: base64ToArrayBuffer(parsed.privateKey),
    }
  } catch (error) {
    console.error("[v0] Failed to retrieve key pair:", error)
    return null
  }
}

/**
 * Export public key to Base64 string for sharing
 * @param publicKey - Public key
 * @returns Base64 encoded public key
 */
export function exportPublicKey(publicKey: Uint8Array): string {
  return arrayBufferToBase64(publicKey)
}

/**
 * Import public key from Base64 string
 * @param base64Key - Base64 encoded public key
 * @returns Public key as Uint8Array
 */
export function importPublicKey(base64Key: string): Uint8Array {
  return base64ToArrayBuffer(base64Key)
}

// Utility functions for encoding/decoding
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
