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

/** Generate a new ECDH key pair */
export async function generateKeyPair(): Promise<KyberKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-384" },
    true,
    ["deriveKey", "deriveBits"]
  )

  const publicKeyRaw = await crypto.subtle.exportKey("spki", keyPair.publicKey)
  const privateKeyRaw = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey)

  return {
    publicKey: new Uint8Array(publicKeyRaw),
    privateKey: new Uint8Array(privateKeyRaw),
  }
}

/** Encrypt a message using recipient's public key */
export async function encryptMessage(message: string, recipientPublicKey: Uint8Array): Promise<EncryptedMessage> {
  const ephemeralKey = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-384" },
    true,
    ["deriveKey", "deriveBits"]
  )

  const recipientKey = await crypto.subtle.importKey(
    "spki",
    recipientPublicKey.buffer,
    { name: "ECDH", namedCurve: "P-384" },
    false,
    []
  )

  const sharedSecret = await crypto.subtle.deriveKey(
    { name: "ECDH", public: recipientKey },
    ephemeralKey.privateKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  )

  const encoder = new TextEncoder()
  const messageBytes = encoder.encode(message)
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sharedSecret,
    messageBytes
  )

  const combined = new Uint8Array(iv.length + ciphertextBuffer.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ciphertextBuffer), iv.length)

  const ephemeralPublicKeyRaw = await crypto.subtle.exportKey("spki", ephemeralKey.publicKey)
  const sharedSecretRaw = await crypto.subtle.exportKey("raw", sharedSecret)

  return {
    ciphertext: arrayBufferToBase64(combined),
    sharedSecret: arrayBufferToBase64(sharedSecretRaw),
    encapsulatedKey: arrayBufferToBase64(new Uint8Array(ephemeralPublicKeyRaw)),
  }
}

/** Decrypt a message using recipient's private key */
export async function decryptMessage(encrypted: EncryptedMessage, privateKey: Uint8Array): Promise<DecryptedMessage> {
  const privateKeyObj = await crypto.subtle.importKey(
    "pkcs8",
    privateKey.buffer,
    { name: "ECDH", namedCurve: "P-384" },
    false,
    ["deriveKey", "deriveBits"]
  )

  const ephemeralPublicKeyRaw = base64ToArrayBuffer(encrypted.encapsulatedKey)
  const ephemeralPublicKey = await crypto.subtle.importKey(
    "spki",
    ephemeralPublicKeyRaw.buffer,
    { name: "ECDH", namedCurve: "P-384" },
    false,
    []
  )

  const sharedSecret = await crypto.subtle.deriveKey(
    { name: "ECDH", public: ephemeralPublicKey },
    privateKeyObj,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  )

  const combined = base64ToArrayBuffer(encrypted.ciphertext)
  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    sharedSecret,
    ciphertext
  )

  const decoder = new TextDecoder()
  return { plaintext: decoder.decode(decryptedBuffer) }
}

/** Export public key as Base64 */
export function exportPublicKey(publicKey: Uint8Array): string {
  return arrayBufferToBase64(publicKey)
}

/** Import public key from Base64 */
export function importPublicKey(base64Key: string): Uint8Array {
  return base64ToArrayBuffer(base64Key)
}

/** Utility functions */
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}
