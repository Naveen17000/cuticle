"use client"

import { createClient } from "@/lib/client"
import {
  generateKeyPair,
  encryptMessage,
  decryptMessage,
  storeKeyPair,
  getStoredKeyPair,
  exportPublicKey,
  importPublicKey,
  type EncryptedMessage,
} from "./kyber"

/* ------------------------------------------------------------------ */
/* Internal Guard */
/* ------------------------------------------------------------------ */

function isBrowser() {
  return typeof window !== "undefined"
}

/* ------------------------------------------------------------------ */
/* Initialize Encryption */
/* ------------------------------------------------------------------ */

export async function initializeUserEncryption(userId: string): Promise<void> {
  if (!isBrowser()) return

  try {
    const existingKeys = getStoredKeyPair(userId)
    if (existingKeys) return

    const keyPair = await generateKeyPair()
    storeKeyPair(userId, keyPair)

    const supabase = createClient()
    const publicKeyBase64 = exportPublicKey(keyPair.publicKey)

    const { error } = await supabase
      .from("profiles")
      .update({ public_key: publicKeyBase64 })
      .eq("id", userId)

    if (error) throw error
  } catch (error) {
    console.error("[encryption-manager] init failed:", error)
  }
}

/* ------------------------------------------------------------------ */
/* Encrypt */
/* ------------------------------------------------------------------ */

export async function encryptForRecipient(
  message: string,
  recipientId: string,
): Promise<EncryptedMessage> {
  if (!isBrowser()) {
    throw new Error("Encryption not available during SSR")
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("public_key")
    .eq("id", recipientId)
    .single()

  if (error || !data?.public_key) {
    throw new Error("Recipient public key not found")
  }

  const recipientPublicKey = importPublicKey(data.public_key)
  return encryptMessage(message, recipientPublicKey)
}

/* ------------------------------------------------------------------ */
/* Decrypt */
/* ------------------------------------------------------------------ */

export async function decryptReceivedMessage(
  encryptedMessage: EncryptedMessage,
  userId: string,
): Promise<string> {
  if (!isBrowser()) {
    throw new Error("Decryption not available during SSR")
  }

  const keyPair = getStoredKeyPair(userId)
  if (!keyPair) throw new Error("Encryption keys not found")

  const { plaintext } = await decryptMessage(encryptedMessage, keyPair.privateKey)
  return plaintext
}

/* ------------------------------------------------------------------ */
/* Status */
/* ------------------------------------------------------------------ */

export function hasEncryptionKeys(userId: string): boolean {
  if (!isBrowser()) return false
  return getStoredKeyPair(userId) !== null
}
