import { NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/server"

// warn only once per server instance if the DB column is missing
let warnedMissingLastRead = false

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const paramsObj: any = await params
    const userId = paramsObj.id
    if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 })

    const supabase = await createServerClient(true)

    // Get conversation ids for user
    // Try to fetch last_read_at if the column exists; fall back if DB doesn't have it yet
    let parts: any = null
    let partsError: any = null
    try {
      const partsRes = await supabase
        .from("conversation_participants")
        .select("conversation_id, last_read_at")
        .eq("user_id", userId)
      parts = partsRes.data
      partsError = partsRes.error
      if (partsError) throw partsError
    } catch (e: any) {
      // If the error is "column does not exist" (Postgres 42703), retry without last_read_at
      if (e && e.code === "42703") {
        if (!warnedMissingLastRead) {
          console.warn("[API] last_read_at column missing, falling back to select without it")
          warnedMissingLastRead = true
        }
        const partsRes2 = await supabase.from("conversation_participants").select("conversation_id").eq("user_id", userId)
        parts = partsRes2.data
        partsError = partsRes2.error
        if (partsError) {
          console.error("[API] Error fetching conversation_participants (fallback):", partsError)
          return NextResponse.json({ error: "Failed to fetch conversation participants", details: partsError }, { status: 500 })
        }
      } else {
        console.error("[API] Error fetching conversation_participants:", e)
        return NextResponse.json({ error: "Failed to fetch conversation participants", details: e }, { status: 500 })
      }
    }

    let conversationIds = parts?.map((p: any) => p.conversation_id) || []
    // dedupe
    conversationIds = Array.from(new Set(conversationIds))
    if (conversationIds.length === 0) return NextResponse.json({ conversations: [] })

    // Get all participant rows for these conversations
    const { data: allParts } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", conversationIds)

    const otherUserMap: Record<string, string | null> = {}
    allParts?.forEach((p: any) => {
      if (!otherUserMap[p.conversation_id]) otherUserMap[p.conversation_id] = null
      if (p.user_id !== userId) otherUserMap[p.conversation_id] = p.user_id
    })

    const otherUserIds = Array.from(new Set(Object.values(otherUserMap).filter(Boolean)))

    const { data: profiles } = await supabase.from("profiles").select("id, display_name, avatar_url, status").in("id", otherUserIds)

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false })

    const lastMessageMap: Record<string, any> = {}
    ;(messages || []).forEach((m: any) => {
      if (!lastMessageMap[m.conversation_id]) lastMessageMap[m.conversation_id] = m
    })

    // compute unread counts per conversation for this user only if last_read_at is available
    const hasLastRead = parts && parts.length > 0 && Object.prototype.hasOwnProperty.call(parts[0], "last_read_at")
    const lastReadMap: Record<string, string | null> = {}
    const unreadCountMap: Record<string, number> = {}

    if (hasLastRead) {
      ;(parts || []).forEach((p: any) => {
        lastReadMap[p.conversation_id] = p.last_read_at || null
      })

      ;(messages || []).forEach((m: any) => {
        // ignore messages sent by the user
        if (m.sender_id === userId) return
        const lastRead = lastReadMap[m.conversation_id]
        if (!lastRead) {
          unreadCountMap[m.conversation_id] = (unreadCountMap[m.conversation_id] || 0) + 1
        } else {
          if (new Date(m.created_at) > new Date(lastRead)) {
            unreadCountMap[m.conversation_id] = (unreadCountMap[m.conversation_id] || 0) + 1
          }
        }
      })
    } else {
      // last_read_at not available; do not compute unread counts to avoid misleading values
    }

    // Collapse multiple conversations per otherUser: pick the most recent conversation per other user
    const convByOther: Record<string, { id: string; otherUser: any; lastMessage: any; unread_count?: number }> = {}

    conversationIds.forEach((cid: string) => {
      const otherId = otherUserMap[cid]
      if (!otherId) return
      const lastMsg = lastMessageMap[cid] || null
      const existing = convByOther[otherId]
      const uc = unreadCountMap[cid] || 0
      if (!existing) {
        convByOther[otherId] = { id: cid, otherUser: profileMap.get(otherId) || null, lastMessage: lastMsg }
        if (uc > 0) convByOther[otherId].unread_count = uc
      } else {
        // choose the conversation with newest message
        const existingTime = existing.lastMessage ? new Date(existing.lastMessage.created_at).getTime() : 0
        const newTime = lastMsg ? new Date(lastMsg.created_at).getTime() : 0
        if (newTime > existingTime) {
          convByOther[otherId] = { id: cid, otherUser: profileMap.get(otherId) || null, lastMessage: lastMsg }
          if (uc > 0) convByOther[otherId].unread_count = uc
        }
      }
    })

    const conversations = Object.values(convByOther).filter((c) => c.otherUser)

    return NextResponse.json({ conversations })
  } catch (err) {
    console.error("[API] Unexpected error fetching user conversations:", err)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
