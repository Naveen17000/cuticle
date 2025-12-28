"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import { format } from "date-fns"
import { PresenceIndicator } from "./presence-indicator"

interface Message {
  sender_id: string
  content: string
  created_at: string
}

interface Conversation {
  id: string
  otherUser: any
  lastMessage?: Message
  last_read_at?: string | null
}

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
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  const loadConversations = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/conversations`)
      const json = await res.json()
      const sorted = (json.conversations || []).sort((a: any, b: any) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0
        const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0
        return bTime - aTime
      })
      setConversations(sorted)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadConversations()

    const channel = supabase
      .channel("conversation-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        ({ new: newMsg }: any) => {
          setConversations(prev => {
            const existingIndex = prev.findIndex(c => c.id === newMsg.conversation_id)
            let updated
            if (existingIndex >= 0) {
              updated = [...prev]
              updated[existingIndex] = {
                ...updated[existingIndex],
                lastMessage: newMsg,
              }
            } else {
              updated = [
                {
                  id: newMsg.conversation_id,
                  otherUser: { display_name: "Unknown", avatar_url: "" },
                  lastMessage: newMsg,
                },
                ...prev,
              ]
            }

            return updated.sort((a, b) => {
              const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0
              const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0
              return bTime - aTime
            })
          })
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  const hasUnread = (c: Conversation) => {
    if (!c.lastMessage) return false
    if (c.lastMessage.sender_id === userId) return false
    if (selectedConversationId === c.id) return false
    if (!c.last_read_at) return true
    return new Date(c.lastMessage.created_at) > new Date(c.last_read_at)
  }

  const filtered = conversations.filter(c =>
    c.otherUser?.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getInitials = (name: string) =>
    name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "U"

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search conversations"
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
              await fetch(`/api/conversations/${c.id}/mark-read`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
              })
              setConversations(prev =>
                prev.map(x => (x.id === c.id ? { ...x, last_read_at: new Date().toISOString() } : x))
              )
              onSelectConversation(c.id)
            }}
            className={`w-full p-4 text-left transition hover:bg-slate-50 ${
              selectedConversationId === c.id ? "bg-slate-100" : ""
            }`}
          >
            <div className="flex gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={c.otherUser?.avatar_url} />
                  <AvatarFallback>{getInitials(c.otherUser?.display_name)}</AvatarFallback>
                </Avatar>
                <PresenceIndicator status={c.otherUser?.status} />
                {hasUnread(c) && <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="font-semibold truncate">{c.otherUser?.display_name}</p>
                  {c.lastMessage && (
                    <span className="text-xs text-slate-500">{format(new Date(c.lastMessage.created_at), "HH:mm")}</span>
                  )}
                </div>
                {c.lastMessage && (
                  <p className="text-sm truncate text-slate-700">{c.lastMessage.content}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </ScrollArea>
    </div>
  )
}
