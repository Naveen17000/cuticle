export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { MessengerLayout } from "@/components/messenger-layout"

export default async function MessengerPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch conversations using service role
  const serviceSupabase = await createClient(true)
  const { data: conversationParticipants } = await serviceSupabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id)

  const conversationIds =
    conversationParticipants?.map((cp) => cp.conversation_id) || []

  return (
    <MessengerLayout
      user={user}
      profile={profile}
      conversationIds={conversationIds}
    />
  )
}
