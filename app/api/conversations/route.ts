import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const { userId, contactId } = await req.json()

    if (!userId || !contactId) {
      return NextResponse.json({ error: "Missing userId or contactId" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({})
      .select()
      .single()

    if (convError) {
      console.error("[API] Conversation insert error:", convError)
      return NextResponse.json({ error: convError.message }, { status: 500 })
    }

    const { error: participantsError } = await supabase
      .from("conversation_participants")
      .insert([
        { conversation_id: conversation.id, user_id: userId },
        { conversation_id: conversation.id, user_id: contactId },
      ])

    if (participantsError) {
      console.error("[API] Participants insert error:", participantsError)
      return NextResponse.json({ error: participantsError.message }, { status: 500 })
    }

    return NextResponse.json({ id: conversation.id }, { status: 201 })
  } catch (err: any) {
    console.error("[API] Unexpected error:", err)
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 })
  }
}
