"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, MessageCircle } from "lucide-react"
import { PresenceIndicator } from "./presence-indicator"

interface Contact {
  id: string
  contact_id: string
  status: string
  profile: any
}

interface ContactsTabProps {
  userId: string
  onStartConversation: (contactId: string) => void
}

export function ContactsTab({ userId, onStartConversation }: ContactsTabProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  useEffect(() => {
    console.log("[ContactsTab] userId:", userId)
    loadContacts()
    subscribeToContacts()
  }, [userId])

  const loadContacts = async () => {
    console.log("[ContactsTab] Loading contacts for userId:", userId)

    // First load contact rows (which reference auth.users)
    const { data: contactRows, error: contactsError } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "accepted")
      .order("created_at", { ascending: false })

    if (contactsError) {
      console.error("[ContactsTab] Error loading contacts:", JSON.stringify(contactsError, null, 2))
      return
    }

    if (!contactRows || contactRows.length === 0) {
      setContacts([])
      return
    }

    // Then load profiles for the contact_ids (profiles.id references auth.users.id)
    const contactIds = contactRows.map((c: any) => c.contact_id)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, status")
      .in("id", contactIds)

    if (profilesError) {
      console.error("[ContactsTab] Error loading profiles:", JSON.stringify(profilesError, null, 2))
      // still map contacts without profile
      setContacts(contactRows)
      return
    }

    const profileMap = new Map(profiles.map((p: any) => [p.id, p]))

    const merged = contactRows.map((c: any) => ({ ...c, profile: profileMap.get(c.contact_id) || null }))

    console.log("[ContactsTab] Contacts loaded:", merged)
    setContacts(merged)
  }

  const subscribeToContacts = () => {
    console.log("[ContactsTab] Subscribing to contacts updates for userId:", userId)
    const channel = supabase
      .channel("contacts_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "contacts",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          console.log("[ContactsTab] Postgres change detected for contacts, reloading...")
          loadContacts()
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        () => {
          console.log("[ContactsTab] Postgres change detected for profiles, reloading contacts...")
          loadContacts()
        },
      )
      .subscribe()

    return () => {
      console.log("[ContactsTab] Unsubscribing from contacts updates for userId:", userId)
      supabase.removeChannel(channel)
    }
  }

  const handleStartConversation = async (contactId: string) => {
    try {
      console.log("[ContactsTab] Starting conversation between", userId, "and", contactId)

      const { data: myParticipations, error: myPartError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId)

      if (myPartError) {
        console.error("[ContactsTab] Error fetching my participations:", myPartError)
      }

      const conversationIds = myParticipations?.map((p) => p.conversation_id) || []

      if (conversationIds.length > 0) {
        const { data: theirParticipations, error: theirPartError } = await supabase
          .from("conversation_participants")
          .select("conversation_id")
          .eq("user_id", contactId)
          .in("conversation_id", conversationIds)

        if (theirPartError) {
          console.error("[ContactsTab] Error fetching their participations:", theirPartError)
        }

        if (theirParticipations && theirParticipations.length > 0) {
          console.log("[ContactsTab] Found existing conversation:", theirParticipations[0].conversation_id)
          onStartConversation(theirParticipations[0].conversation_id)
          return
        }
      }

      // Create conversation + participants via server API (service role) to satisfy RLS
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, contactId }),
      })

      let payload: any = null
      try {
        payload = await res.json()
      } catch (e) {
        const text = await res.text().catch(() => "<unreadable>")
        console.error("[ContactsTab] Failed to parse JSON response. status=", res.status, res.statusText, "text=", text)
        return
      }

      if (!res.ok || !payload?.id) {
        console.error("[ContactsTab] Error creating conversation: status=", res.status, res.statusText, "payload=", payload)
        return
      }

      console.log("[ContactsTab] Conversation created via API:", payload.id)
      onStartConversation(payload.id)
    } catch (err) {
      console.error("[ContactsTab] Unexpected error in handleStartConversation:", err)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const filteredContacts = contacts.filter((contact) =>
    contact.profile?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-slate-200 p-4">
        <h2 className="text-lg font-semibold text-slate-900">Contacts</h2>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            {contacts.length === 0 ? "No contacts yet" : "No matching contacts"}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contact.profile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-slate-200 text-slate-700">
                        {getInitials(contact.profile?.display_name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <PresenceIndicator status={contact.profile?.status || "offline"} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{contact.profile?.display_name}</p>
                    <p className="text-xs text-slate-500 capitalize">{contact.profile?.status || "offline"}</p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleStartConversation(contact.contact_id)}
                  className="h-8 w-8"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
