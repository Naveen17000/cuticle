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

/**
 * Initialize encryption for a user
 * Generates key pair if not exists and stores public key in database
 */
export async function initializeUserEncryption(userId: string): Promise<void> {
  try {
    // Check if keys already exist
    const existingKeys = getStoredKeyPair(userId)
    if (existingKeys) {
      return
    }

    // Generate new key pair
    const keyPair = await generateKeyPair()

    // Store locally
    storeKeyPair(userId, keyPair)

    // Store public key in database
    const supabase = createClient()
    const publicKeyBase64 = exportPublicKey(keyPair.publicKey)

    const { error } = await supabase
      .from("profiles")
      .update({
        public_key: publicKeyBase64,
      })
      .eq("id", userId)

    if (error) {
      throw error
    }
  } catch (error) {
    console.error("[v0] Encryption initialization failed:", error)
    throw new Error("Failed to initialize encryption")
  }
}

/**
 * Encrypt a message for a specific recipient
 */
export async function encryptForRecipient(message: string, recipientId: string): Promise<EncryptedMessage> {
  try {
    // Fetch recipient's public key from database
    const supabase = createClient()
    const { data: profile, error } = await supabase.from("profiles").select("public_key").eq("id", recipientId).single()

    if (error || !profile?.public_key) {
      throw new Error("Recipient public key not found")
    }

    // Import and encrypt
    const recipientPublicKey = importPublicKey(profile.public_key)
    return await encryptMessage(message, recipientPublicKey)
  } catch (error) {
    console.error("[v0] Failed to encrypt for recipient:", error)
    throw new Error("Encryption failed")
  }
}

/**
 * Decrypt a received message
 */
export async function decryptReceivedMessage(encryptedMessage: EncryptedMessage, userId: string): Promise<string> {
  try {
    // Get user's private key
    const keyPair = getStoredKeyPair(userId)
    if (!keyPair) {
      throw new Error("Encryption keys not found")
    }

    // Decrypt
    const { plaintext } = await decryptMessage(encryptedMessage, keyPair.privateKey)
    return plaintext
  } catch (error) {
    console.error("[v0] Failed to decrypt message:", error)
    throw new Error("Decryption failed")
  }
}

/**
 * Check if user has encryption keys initialized
 */
export function hasEncryptionKeys(userId: string): boolean {
  return getStoredKeyPair(userId) !== null
}
