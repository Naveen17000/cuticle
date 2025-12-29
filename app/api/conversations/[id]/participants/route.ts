import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/server"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await context.params

    if (!conversationId) {
      return NextResponse.json(
        { error: "Missing conversation id" },
        { status: 400 }
      )
    }

    const supabase = await createServerClient(true)

    const { data: participants, error: partError } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)

    if (partError) {
      console.error("[API] Error fetching participants:", partError)
      return NextResponse.json(
        { error: "Failed to fetch participants", details: partError },
        { status: 500 }
      )
    }

    const ids = (participants ?? []).map((p: any) => p.user_id)

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, status")
      .in("id", ids)

    if (profilesError) {
      console.error("[API] Error fetching profiles:", profilesError)
      return NextResponse.json(
        { error: "Failed to fetch profiles", details: profilesError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      participants: participants ?? [],
      profiles: profiles ?? [],
    })
  } catch (err) {
    console.error("[API] Unexpected error fetching participants:", err)
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    )
  }
}
