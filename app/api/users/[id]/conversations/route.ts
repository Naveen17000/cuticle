import { NextResponse, type NextRequest } from "next/server"
import { createClient as createServerClient } from "@/lib/server"

// warn only once per server instance if the DB column is missing
let warnedMissingLastRead = false

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await context.params

    if (!userId) {
      return NextResponse.json(
        { error: "Missing user id" },
        { status: 400 }
      )
    }

    const supabase = await createServerClient(true)

    // --- fetch conversation ids (with graceful fallback) ---
    let parts: any[] | null = null

    try {
      const { data, error } = await supabase
        .from("conversation_participants")
        .select("conversation_id, last_read_at")
        .eq("user_id", userId)

      if (error) throw error
      parts = data
    } catch (e: any) {
      if (e?.code === "42703") {
        if (!warnedMissingLastRead) {
          console.warn("[API] last_read_at column missing, falling back")
          warnedMissingLastRead = true
        }

        const { data, error } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", userId)

        if (error) {
          return NextResponse.json(
            { error: "Failed to fetch conversation participants", details: error },
            { status: 500 }
          )
        }

        parts = data
      } else {
        return NextResponse.json(
          { error: "Failed to fetch conversation participants", details: e },
          { status: 500 }
        )
      }
    }

    const conversationIds = Array.from(
      new Set((parts ?? []).map((p) => p.conversation_id))
    )

    if (conversationIds.length === 0) {
      return NextResponse.json({ conversations: [] })
    }

    // --- fetch all participants ---
    const { data: allParts } = await supabase
      .from("conversation_participants")
      .select("conversation_id, user_id")
      .in("conversation_id", conversationIds)

    const otherUserMap: Record<string, string | null> = {}

    allParts?.forEach((p: any) => {
      if (!otherUserMap[p.conversation_id]) {
        otherUserMap[p.conversation_id] = null
      }
      if (p.user_id !== userId) {
        otherUserMap[p.conversation_id] = p.user_id
      }
    })

    const otherUserIds = Array.from(
      new Set(Object.values(otherUserMap).filter(Boolean))
    )

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, status")
      .in("id", otherUserIds)

    const profileMap = new Map(
      (profiles ?? []).map((p: any) => [p.id, p])
    )

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false })

    const lastMessageMap: Record<string, any> = {}
    messages?.forEach((m: any) => {
      if (!lastMessageMap[m.conversation_id]) {
        lastMessageMap[m.conversation_id] = m
      }
    })

    const hasLastRead =
      parts &&
      parts.length > 0 &&
      Object.prototype.hasOwnProperty.call(parts[0], "last_read_at")

    const lastReadMap: Record<string, string | null> = {}
    const unreadCountMap: Record<string, number> = {}

    if (hasLastRead) {
      parts?.forEach((p: any) => {
        lastReadMap[p.conversation_id] = p.last_read_at ?? null
      })

      messages?.forEach((m: any) => {
        if (m.sender_id === userId) return
        const lastRead = lastReadMap[m.conversation_id]
        if (!lastRead || new Date(m.created_at) > new Date(lastRead)) {
          unreadCountMap[m.conversation_id] =
            (unreadCountMap[m.conversation_id] ?? 0) + 1
        }
      })
    }

    const convByOther: Record<
      string,
      { id: string; otherUser: any; lastMessage: any; unread_count?: number }
    > = {}

    conversationIds.forEach((cid) => {
      const otherId = otherUserMap[cid]
      if (!otherId) return

      const lastMsg = lastMessageMap[cid] ?? null
      const unread = unreadCountMap[cid] ?? 0
      const existing = convByOther[otherId]

      if (
        !existing ||
        (lastMsg &&
          new Date(lastMsg.created_at) >
            new Date(existing.lastMessage?.created_at ?? 0))
      ) {
        convByOther[otherId] = {
          id: cid,
          otherUser: profileMap.get(otherId) ?? null,
          lastMessage: lastMsg,
          ...(unread > 0 ? { unread_count: unread } : {}),
        }
      }
    })

    return NextResponse.json({
      conversations: Object.values(convByOther).filter((c) => c.otherUser),
    })
  } catch (err) {
    console.error("[API] Unexpected error fetching user conversations:", err)
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    )
  }
}
