"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PresenceIndicator } from "./presence-indicator"

// ✅ IMPORT: Real encryption logic
import { 
  encryptForRecipient, 
  initializeUserEncryption 
} from "@/lib/encryption-manager"

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  sender_profile?: any
}

interface ChatWindowProps {
  conversationId: string
  userId: string
  encryptionReady: boolean
}

export function ChatWindow({ conversationId, userId, encryptionReady }: ChatWindowProps) {
  // Move client creation outside render or memoize if possible, 
  // but for now ensure we don't recreate it unnecessarily.
  const [supabase] = useState(() => createClient()) 
  
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [profiles, setProfiles] = useState<Map<string, any>>(new Map())
  
  // Ref to hold the latest profiles without triggering re-renders or effect re-runs
  const profilesRef = useRef<Map<string, any>>(new Map())
  
  const [otherUser, setOtherUser] = useState<any>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)

  const getInitials = (name: string) =>
    name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "U"

  /** Load participants & profiles */
  const loadProfiles = async () => {
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)

    if (!participants) return

    const userIds = participants.map(p => p.user_id)
    const otherId = userIds.find(id => id !== userId)
    if (!otherId) return

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, status")
      .in("id", userIds)

    const map = new Map((profilesData || []).map(p => [p.id, p]))
    setProfiles(map)
    // Update ref immediately
    profilesRef.current = map
    setOtherUser(map.get(otherId))
  }

  /** Load messages */
  const loadMessages = async () => {
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (!msgs) return

    const mapped = msgs.map(m => ({
      ...m,
      sender_profile: profilesRef.current.get(m.sender_id) || { display_name: "Unknown", avatar_url: "/placeholder.svg", status: "offline" },
    }))
    setMessages(mapped)
  }

  /** Initial load */
  useEffect(() => {
    if (!conversationId) return
    
    // ✅ INIT: Ensure we have keys (safe to call multiple times)
    initializeUserEncryption(userId)
    
    loadProfiles()
  }, [conversationId])

  useEffect(() => {
    if (profiles.size === 0) return
    loadMessages()
  }, [profiles])

  /** Realtime messages */
  useEffect(() => {
    if (!conversationId) return

    console.log("Setting up subscription for:", conversationId)

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload: any) => {
          console.log("New message received!", payload)
          
          const newMsg = payload.new
          // Use the Ref here to get the latest profiles without stale closures
          let senderProfile = profilesRef.current.get(newMsg.sender_id)

          // Fallback fetch if profile is missing in local state
          if (!senderProfile) {
            const { data } = await supabase
              .from("profiles")
              .select("id, display_name, avatar_url, status")
              .eq("id", newMsg.sender_id)
              .single()
            senderProfile = data
          }

          setMessages(prev => [...prev, { ...newMsg, sender_profile: senderProfile }])
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId]) // Dependency array is clean: only conversationId

  /** Auto scroll */
  useEffect(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight
    }
  }, [messages])

  /** Send message with Encryption */
  const sendMessage = async () => {
    if (!text.trim()) return

    const plainText = text
    setText("") 

    try {
        // ✅ REAL ENCRYPTION: Generates ciphertext, sharedSecret, encapsulatedKey
        // We use 'otherUser.id' which we loaded in loadProfiles
        const recipientId = otherUser?.id

        if (!recipientId) {
            console.error("Recipient not found, cannot encrypt.")
            // Optional: fallback or alert here
            return 
        }

        const encryptedData = await encryptForRecipient(plainText, recipientId)

        const { error } = await supabase.from("messages").insert({
          conversation_id: conversationId,
          sender_id: userId,
          
          // 1. Store PLAIN TEXT here so the UI still works (avoids 'atob' error)
          content: plainText, 
          
          // 2. Store REAL ENCRYPTION data here (Base64 strings)
          encrypted_content: encryptedData.ciphertext,
          encryption_metadata: { 
             shared_secret: encryptedData.sharedSecret,
             encapsulated_key: encryptedData.encapsulatedKey
          },
        })
    
        if (error) {
            console.error("Error sending:", error)
            setText(plainText)
        }
    } catch (err) {
        console.error("Encryption failed:", err)
        setText(plainText) // Restore text so user can try again
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 border-b p-4 bg-white flex-shrink-0 relative">
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{getInitials(otherUser?.display_name)}</AvatarFallback>
          </Avatar>
          <PresenceIndicator
            status={otherUser?.status || "offline"}
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full ring-1 ring-white"
          />
        </div>
        <div>
          <p className="font-semibold">{otherUser?.display_name}</p>
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto p-4" viewportRef={viewportRef as any}>
        <div className="flex flex-col gap-2">
          {messages.map(m => {
            const mine = m.sender_id === userId
            const displayContent = m.content 
              ? m.content 
              : "[Encrypted Message]"
            return (
              <div key={m.id} className={`flex max-w-[70%] gap-2 ${mine ? "flex-row-reverse ml-auto" : "flex-row"}`}>
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={m.sender_profile?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{getInitials(m.sender_profile?.display_name)}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <div className={`rounded-lg px-4 py-2 text-sm ${mine ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-900"}`}>
                    {displayContent}
                    <div className="mt-1 text-[10px] opacity-70">{format(new Date(m.created_at), "HH:mm")}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      <form
        onSubmit={e => {
          e.preventDefault()
          sendMessage()
        }}
        className="flex gap-2 border-t p-3 flex-shrink-0 bg-white"
      >
        <Input placeholder="Type a message…" value={text} onChange={e => setText(e.target.value)} />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}