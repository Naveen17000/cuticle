import { NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const paramsObj: any = await params
    const conversationId = paramsObj.id
    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversation id" }, { status: 400 })
    }

    const supabase = await createServerClient(true)

    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (messagesError) {
      console.error("[API] Error fetching messages:", messagesError)
      return NextResponse.json({ error: "Failed to fetch messages", details: messagesError }, { status: 500 })
    }

    const senderIds = Array.from(new Set((messages || []).map((m: any) => m.sender_id)))
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", senderIds)

    if (profilesError) {
      console.error("[API] Error fetching profiles for messages:", profilesError)
      return NextResponse.json({ error: "Failed to fetch profiles", details: profilesError }, { status: 500 })
    }

    return NextResponse.json({ messages, profiles })
  } catch (err) {
    console.error("[API] Unexpected error fetching messages:", err)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
