"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react" // Removed Lock/Users import
import { format } from "date-fns"
import { PresenceIndicator } from "./presence-indicator"

interface ConversationListProps {
  userId: string
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
}

export function ConversationList({
  userId,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [supabase] = useState(() => createClient())

  const fetchConversations = async () => {
    if (!userId) return

    try {
      // 1. Get my participation stats
      const { data: myParticipations, error: partError } = await supabase
        .from("conversation_participants")
        .select("conversation_id, last_read_at")
        .eq("user_id", userId)

      if (partError || !myParticipations) return

      const conversationIds = myParticipations.map(p => p.conversation_id)
      if (conversationIds.length === 0) {
        setConversations([])
        return
      }

      // 2. Get Conversation Details
      const { data: convDetails } = await supabase
        .from("conversations")
        .select("*")
        .in("id", conversationIds)

      // 3. Get Participants
      const { data: allParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", conversationIds)

      // 4. Get Profiles
      const allUserIds = Array.from(new Set(allParticipants?.map(p => p.user_id) || []))
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, status, public_key")
        .in("id", allUserIds)

      const profileMap = new Map(profilesData?.map(p => [p.id, p]))

      // 5. Build List
      const formatted = convDetails?.map((conv: any) => {
         const myState = myParticipations.find(p => p.conversation_id === conv.id)
         const chatParticipantIds = allParticipants?.filter(p => p.conversation_id === conv.id).map(p => p.user_id) || []

         let displayName = "Unknown Chat"
         let avatarUrl = null
         let status = "offline"

         if (conv.is_group) {
             displayName = conv.name || "Group Chat"
         } else {
             const otherId = chatParticipantIds.find(id => id !== userId)
             const otherProfile = otherId ? profileMap.get(otherId) : null
             if (otherProfile) {
                 displayName = otherProfile.display_name
                 avatarUrl = otherProfile.avatar_url
                 status = otherProfile.status
             } else {
                 displayName = "Note to Self"
             }
         }

         const lastMessageTime = new Date(conv.last_message_at || 0).getTime()
         const lastReadTime = new Date(myState?.last_read_at || 0).getTime()
         // Buffer 1s
         const isUnread = lastMessageTime > (lastReadTime + 1000)

         return {
            id: conv.id,
            name: displayName,
            avatar_url: avatarUrl,
            status: status,
            last_message_at: conv.last_message_at,
            is_unread: isUnread,
            is_group: conv.is_group
         }
      })

      const sorted = (formatted || []).sort((a, b) => 
          new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
      )

      setConversations(sorted)

    } catch (err) {
        console.error("Fetch error:", err)
    }
  }

  useEffect(() => {
    fetchConversations()

    const channel = supabase
      .channel("conversation_list_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => fetchConversations())
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => fetchConversations())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getInitials = (name: string) =>
    name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "U"

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      <div className="border-b p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9 bg-slate-50 border-slate-200"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {filtered.map(c => (
          <button
            key={c.id}
            onClick={async () => {
              setConversations(prev =>
                prev.map(x => (x.id === c.id ? { ...x, is_unread: false } : x))
              )
              await supabase
                .from("conversation_participants")
                .update({ last_read_at: new Date().toISOString() })
                .eq("conversation_id", c.id)
                .eq("user_id", userId)
              
              onSelectConversation(c.id)
            }}
            className={`w-full p-4 text-left transition hover:bg-slate-50 border-b border-slate-100 ${
              selectedConversationId === c.id ? "bg-slate-100" : ""
            }`}
          >
            <div className="flex gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border border-slate-200">
                  <AvatarImage src={c.avatar_url} />
                  <AvatarFallback>{getInitials(c.name)}</AvatarFallback>
                </Avatar>
                
                {!c.is_group && (
                   <PresenceIndicator 
                      status={c.status} 
                      className="absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white"
                   />
                )}
                
                {c.is_unread && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className={`truncate text-sm font-medium text-slate-900`}>
                      {c.name}
                  </p>
                  {c.last_message_at && (
                    <span className="text-[10px] text-slate-400 ml-1 flex-shrink-0">
                        {format(new Date(c.last_message_at), "HH:mm")}
                    </span>
                  )}
                </div>
                
                {/* --- UPDATED PREVIEW TEXT --- */}
                <div className="mt-1">
                    <p className={`text-xs truncate ${c.is_unread ? "text-slate-900 font-semibold" : "text-slate-500"}`}>
                        {c.is_unread ? "New message" : "Encrypted message"}
                    </p>
                </div>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-400">
                No conversations found.
            </div>
        )}
      </ScrollArea>
    </div>
  )
}