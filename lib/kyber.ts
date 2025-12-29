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

/* ------------------ helpers ------------------ */

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(u8.byteLength)
  new Uint8Array(buffer).set(u8)
  return buffer
}


function arrayBufferToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/* ------------------ key generation ------------------ */

export async function generateKeyPair(): Promise<KyberKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-384" },
    true,
    ["deriveKey", "deriveBits"]
  )

  const publicKey = new Uint8Array(
    await crypto.subtle.exportKey("spki", keyPair.publicKey)
  )

  const privateKey = new Uint8Array(
    await crypto.subtle.exportKey("pkcs8", keyPair.privateKey)
  )

  return { publicKey, privateKey }
}

/* ------------------ encryption ------------------ */

export async function encryptMessage(
  message: string,
  recipientPublicKey: Uint8Array
): Promise<EncryptedMessage> {

  const ephemeral = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-384" },
    true,
    ["deriveKey", "deriveBits"]
  )

  const recipientKey = await crypto.subtle.importKey(
    "spki",
    toArrayBuffer(recipientPublicKey), // ✅ FIX
    { name: "ECDH", namedCurve: "P-384" },
    false,
    []
  )

  const sharedKey = await crypto.subtle.deriveKey(
    { name: "ECDH", public: recipientKey },
    ephemeral.privateKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  )

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const data = new TextEncoder().encode(message)

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sharedKey,
    data
  )

  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)

  return {
    ciphertext: arrayBufferToBase64(combined),
    sharedSecret: arrayBufferToBase64(
      await crypto.subtle.exportKey("raw", sharedKey)
    ),
    encapsulatedKey: arrayBufferToBase64(
      await crypto.subtle.exportKey("spki", ephemeral.publicKey)
    ),
  }
}

/* ------------------ decryption ------------------ */

export async function decryptMessage(
  encrypted: EncryptedMessage,
  privateKey: Uint8Array
): Promise<DecryptedMessage> {

  const privKey = await crypto.subtle.importKey(
    "pkcs8",
    toArrayBuffer(privateKey), // ✅ FIX
    { name: "ECDH", namedCurve: "P-384" },
    false,
    ["deriveKey", "deriveBits"]
  )

  const pubKey = await crypto.subtle.importKey(
    "spki",
    toArrayBuffer(base64ToUint8Array(encrypted.encapsulatedKey)), // ✅ FIX
    { name: "ECDH", namedCurve: "P-384" },
    false,
    []
  )

  const sharedKey = await crypto.subtle.deriveKey(
    { name: "ECDH", public: pubKey },
    privKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  )

  const combined = base64ToUint8Array(encrypted.ciphertext)
  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    sharedKey,
    ciphertext
  )

  return { plaintext: new TextDecoder().decode(decrypted) }
}

/* ------------------ storage ------------------ */

export function storeKeyPair(userId: string, keyPair: KyberKeyPair) {
  localStorage.setItem(
    `encryption_keys_${userId}`,
    JSON.stringify({
      publicKey: arrayBufferToBase64(keyPair.publicKey),
      privateKey: arrayBufferToBase64(keyPair.privateKey),
    })
  )
}

export function getStoredKeyPair(userId: string): KyberKeyPair | null {
  const raw = localStorage.getItem(`encryption_keys_${userId}`)
  if (!raw) return null

  const parsed = JSON.parse(raw)
  return {
    publicKey: base64ToUint8Array(parsed.publicKey),
    privateKey: base64ToUint8Array(parsed.privateKey),
  }
}

export function exportPublicKey(key: Uint8Array): string {
  return arrayBufferToBase64(key)
}

export function importPublicKey(base64: string): Uint8Array {
  return base64ToUint8Array(base64)
}
