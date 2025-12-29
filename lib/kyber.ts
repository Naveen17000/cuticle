"use client"

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Internal Guards */
/* ------------------------------------------------------------------ */

function ensureBrowser() {
  if (typeof window === "undefined" || !crypto?.subtle) {
    throw new Error("[kyber] WebCrypto is not available (SSR/build phase)")
  }
}

/* ------------------------------------------------------------------ */
/* Key Generation */
/* ------------------------------------------------------------------ */

export async function generateKeyPair(): Promise<KyberKeyPair> {
  ensureBrowser()

  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-384" },
    true,
    ["deriveKey", "deriveBits"],
  )

  const publicKeyRaw = await crypto.subtle.exportKey("spki", keyPair.publicKey)
  const privateKeyRaw = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey)

  return {
    publicKey: new Uint8Array(publicKeyRaw),
    privateKey: new Uint8Array(privateKeyRaw),
  }
}

/* ------------------------------------------------------------------ */
/* Encryption */
/* ------------------------------------------------------------------ */

export async function encryptMessage(
  message: string,
  recipientPublicKey: Uint8Array,
): Promise<EncryptedMessage> {
  ensureBrowser()

  const ephemeralKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-384" },
    true,
    ["deriveKey", "deriveBits"],
  )

  const recipientKey = await crypto.subtle.importKey(
    "spki",
    recipientPublicKey.buffer, // ✅ critical fix
    { name: "ECDH", namedCurve: "P-384" },
    false,
    [],
  )

  const sharedSecret = await crypto.subtle.deriveKey(
    { name: "ECDH", public: recipientKey },
    ephemeralKeyPair.privateKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  )

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(message)

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sharedSecret,
    encoded,
  )

  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)

  const ephPubRaw = await crypto.subtle.exportKey("spki", ephemeralKeyPair.publicKey)
  const secretRaw = await crypto.subtle.exportKey("raw", sharedSecret)

  return {
    ciphertext: arrayBufferToBase64(combined),
    sharedSecret: arrayBufferToBase64(secretRaw),
    encapsulatedKey: arrayBufferToBase64(new Uint8Array(ephPubRaw)),
  }
}

/* ------------------------------------------------------------------ */
/* Decryption */
/* ------------------------------------------------------------------ */

export async function decryptMessage(
  encrypted: EncryptedMessage,
  privateKey: Uint8Array,
): Promise<DecryptedMessage> {
  ensureBrowser()

  const privateKeyObj = await crypto.subtle.importKey(
    "pkcs8",
    privateKey.buffer, // ✅ critical fix
    { name: "ECDH", namedCurve: "P-384" },
    false,
    ["deriveKey", "deriveBits"],
  )

  const ephemeralRaw = base64ToArrayBuffer(encrypted.encapsulatedKey)
  const ephemeralKey = await crypto.subtle.importKey(
    "spki",
    ephemeralRaw.buffer, // ✅ critical fix
    { name: "ECDH", namedCurve: "P-384" },
    false,
    [],
  )

  const sharedSecret = await crypto.subtle.deriveKey(
    { name: "ECDH", public: ephemeralKey },
    privateKeyObj,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  )

  const combined = base64ToArrayBuffer(encrypted.ciphertext)
  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    sharedSecret,
    ciphertext,
  )

  return { plaintext: new TextDecoder().decode(decrypted) }
}

/* ------------------------------------------------------------------ */
/* Storage */
/* ------------------------------------------------------------------ */

export function storeKeyPair(userId: string, keyPair: KyberKeyPair) {
  if (typeof window === "undefined") return

  localStorage.setItem(
    `encryption_keys_${userId}`,
    JSON.stringify({
      publicKey: arrayBufferToBase64(keyPair.publicKey),
      privateKey: arrayBufferToBase64(keyPair.privateKey),
    }),
  )
}

export function getStoredKeyPair(userId: string): KyberKeyPair | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(`encryption_keys_${userId}`)
  if (!stored) return null

  const parsed = JSON.parse(stored)
  return {
    publicKey: base64ToArrayBuffer(parsed.publicKey),
    privateKey: base64ToArrayBuffer(parsed.privateKey),
  }
}

/* ------------------------------------------------------------------ */
/* Public Key Helpers */
/* ------------------------------------------------------------------ */

export function exportPublicKey(publicKey: Uint8Array): string {
  return arrayBufferToBase64(publicKey)
}

export function importPublicKey(base64Key: string): Uint8Array {
  return base64ToArrayBuffer(base64Key)
}

/* ------------------------------------------------------------------ */
/* Utils */
/* ------------------------------------------------------------------ */

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}
