"use client"

import { createClient } from "@/lib/client"

interface TypingIndicatorRow {
  user_id: string
  conversation_id: string
  is_typing: boolean
  updated_at: string
}

/**
 * Update user's online status
 */
export async function updateUserStatus(
  userId: string,
  status: "online" | "away" | "busy" | "offline"
) {
  const supabase = createClient()

  const { error } = await supabase
    .from("profiles")
    .update({
      status,
      last_seen: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    console.error("[v0] Failed to update status:", error)
  }
}

/**
 * Set user as online and keep presence active
 */
export function startPresenceTracking(userId: string) {
  if (typeof window === "undefined") return () => {}

  updateUserStatus(userId, "online")

  const intervalId = setInterval(() => {
    updateUserStatus(userId, "online")
  }, 30000)

  const handleBeforeUnload = () => {
    updateUserStatus(userId, "offline")
  }

  window.addEventListener("beforeunload", handleBeforeUnload)

  return () => {
    clearInterval(intervalId)
    window.removeEventListener("beforeunload", handleBeforeUnload)
    updateUserStatus(userId, "offline")
  }
}

/**
 * Subscribe to presence updates for specific users
 */
export function subscribeToPresence(
  userIds: string[],
  onUpdate: (userId: string, status: string) => void
) {
  const supabase = createClient()

  const channel = supabase
    .channel("presence_updates")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "profiles",
        filter: `id=in.(${userIds.join(",")})`,
      },
      (payload) => {
        onUpdate(payload.new.id, payload.new.status)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Update typing indicator for a conversation
 */
export async function updateTypingIndicator(
  userId: string,
  conversationId: string,
  isTyping: boolean
) {
  const supabase = createClient()

  const { error } = await supabase.from("typing_indicators").upsert(
    {
      user_id: userId,
      conversation_id: conversationId,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "conversation_id,user_id",
    }
  )

  if (error) {
    console.error("[v0] Failed to update typing indicator:", error)
  }
}

/**
 * Subscribe to typing indicators for a conversation
 */
export function subscribeToTyping(
  conversationId: string,
  userId: string,
  onUpdate: (isTyping: boolean) => void
) {
  const supabase = createClient()

  const channel = supabase
    .channel(`typing:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "typing_indicators",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const newRow = payload.new as TypingIndicatorRow | null

        if (!newRow) return
        if (newRow.user_id === userId) return

        onUpdate(newRow.is_typing)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
