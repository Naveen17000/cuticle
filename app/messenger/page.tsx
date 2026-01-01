export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/server"
import { MessengerLayout } from "@/components/messenger-layout"

export default async function MessengerPage() {
  const supabase = await createClient()

  // 1. Check Authentication
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // 2. Fetch User Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // 3. Fetch Conversation IDs 
  // (We use these to subscribe to realtime updates in the layout)
  const { data: conversationParticipants } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id)

  const conversationIds =
    conversationParticipants?.map((cp) => cp.conversation_id) || []

  // 4. Render the Responsive Layout
  return (
    <MessengerLayout
      user={user}
      profile={profile}
      conversationIds={conversationIds}
    />
  )
}