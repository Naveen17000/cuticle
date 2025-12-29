import { NextRequest, NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/server"

// warn once per server instance
let warnedMarkReadMissing = false

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await context.params
    const body = await req.json()
    const userId = body?.userId

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: "Missing conversation id or user id" },
        { status: 400 }
      )
    }

    const supabase = await createServerClient(true)

    const { data, error } = await supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .match({
        conversation_id: conversationId,
        user_id: userId,
      })
      .select()

    if (error) {
      // Graceful handling if column is missing
      if (error.code === "PGRST204" || error.code === "42703") {
        if (!warnedMarkReadMissing) {
          console.warn(
            "[API] last_read_at column missing when marking read:",
            error
          )
          warnedMarkReadMissing = true
        }

        return NextResponse.json({
          ok: false,
          message:
            "last_read_at column missing; run migration scripts/009_add_last_read.sql",
        })
      }

      console.error("[API] Error marking conversation read:", error)
      return NextResponse.json(
        { error: "Failed to mark read", details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, updated: data })
  } catch (err) {
    console.error("[API] Unexpected error in mark-read:", err)
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    )
  }
}
