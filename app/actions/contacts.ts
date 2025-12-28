"use server"

import { createClient } from "@/lib/server"
import { revalidatePath } from "next/cache"

export async function addContact(userEmail: string) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Unauthorized" }
  }

  try {
    // Find the user by email
    const { data: profiles, error: searchError } = await supabase
      .from("profiles")
      .select("id, display_name, email")
      .eq("email", userEmail.toLowerCase().trim())
      .single()

    if (searchError || !profiles) {
      return { error: "User not found. Please check the email address." }
    }

    const contactId = profiles.id

    // Check if trying to add yourself
    if (contactId === user.id) {
      return { error: "You cannot add yourself as a contact" }
    }

    // Check if already contacts
    const { data: existingContact } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id)
      .eq("contact_id", contactId)
      .maybeSingle()

    if (existingContact) {
      return { error: "Already in your contacts" }
    }

    // Add contact
    const { error: insertError } = await supabase.from("contacts").insert({
      user_id: user.id,
      contact_id: contactId,
      status: "accepted",
    })

    if (insertError) {
      console.error("[v0] Contact insert error:", insertError)
      return { error: "Failed to add contact" }
    }

    // Create reverse contact
    await supabase.from("contacts").insert({
      user_id: contactId,
      contact_id: user.id,
      status: "accepted",
    })

    // Create conversation
    const { data: conversation, error: convError } = await supabase.from("conversations").insert({}).select().single()

    if (convError) {
      console.error("[v0] Conversation insert error:", convError)
      return { error: "Failed to create conversation" }
    }

    // Add participants
    const { error: participantsError } = await supabase.from("conversation_participants").insert([
      { conversation_id: conversation.id, user_id: user.id },
      { conversation_id: conversation.id, user_id: contactId },
    ])

    if (participantsError) {
      console.error("[v0] Participants insert error:", participantsError)
      return { error: "Failed to add conversation participants" }
    }

    revalidatePath("/", "layout")
    return { success: true }
  } catch (err) {
    console.error("[v0] Add contact error:", err)
    return { error: "An unexpected error occurred" }
  }
}
