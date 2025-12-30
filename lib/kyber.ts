// lib/kyber.ts
import { MlKem768 } from "crystals-kyber-js";

export interface KyberKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export interface EncryptedMessage {
  ciphertext: string;       
  sharedSecret: string;     
  encapsulatedKey: string;  
}

export interface DecryptedMessage {
  plaintext: string;
}

/* ------------------ Helpers ------------------ */

function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/* ------------------ Key Generation ------------------ */

export async function generateKeyPair(): Promise<KyberKeyPair> {
  const recipient = new MlKem768();
  const [pk, sk] = await recipient.generateKeyPair();

  return { 
    publicKey: pk, 
    privateKey: sk 
  };
}

/* ------------------ Encryption ------------------ */

export async function encryptMessage(
  message: string,
  recipientPublicKey: Uint8Array
): Promise<EncryptedMessage> {
  
  if (recipientPublicKey.length !== 1184) {
    throw new Error(
      `Invalid recipient key size: ${recipientPublicKey.length} bytes. Expected 1184 bytes (ML-KEM-768).`
    );
  }

  const sender = new MlKem768();
  const [c, ss] = await sender.encap(recipientPublicKey);

  // FIX: Force TypeScript to accept 'ss' as a BufferSource
  const aesKey = await crypto.subtle.importKey(
    "raw",
    ss as unknown as BufferSource, 
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(message);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    data
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return {
    ciphertext: arrayBufferToBase64(combined),      
    encapsulatedKey: arrayBufferToBase64(c),        
    sharedSecret: arrayBufferToBase64(ss),          
  };
}

/* ------------------ Decryption ------------------ */

export async function decryptMessage(
  encrypted: EncryptedMessage,
  privateKey: Uint8Array
): Promise<DecryptedMessage> {

  const receiver = new MlKem768();
  const kyberCiphertext = base64ToUint8Array(encrypted.encapsulatedKey);
  
  const ss = await receiver.decap(kyberCiphertext, privateKey);

  // FIX: Force TypeScript to accept 'ss' as a BufferSource here too
  const aesKey = await crypto.subtle.importKey(
    "raw",
    ss as unknown as BufferSource,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const combined = base64ToUint8Array(encrypted.ciphertext);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    aesKey,
    ciphertext
  );

  return { plaintext: new TextDecoder().decode(decrypted) };
}

/* ------------------ Storage Helpers ------------------ */

export function storeKeyPair(userId: string, keyPair: KyberKeyPair) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    `encryption_keys_${userId}`,
    JSON.stringify({
      publicKey: arrayBufferToBase64(keyPair.publicKey),
      privateKey: arrayBufferToBase64(keyPair.privateKey),
    })
  );
}

export function getStoredKeyPair(userId: string): KyberKeyPair | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(`encryption_keys_${userId}`);
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  return {
    publicKey: base64ToUint8Array(parsed.publicKey),
    privateKey: base64ToUint8Array(parsed.privateKey),
  };
}

export function exportPublicKey(key: Uint8Array): string {
  return arrayBufferToBase64(key);
}

export function importPublicKey(base64: string): Uint8Array {
  return base64ToUint8Array(base64);
}