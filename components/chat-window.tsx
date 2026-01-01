"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Lock, Smile, ArrowLeft } from "lucide-react" // Added ArrowLeft
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PresenceIndicator } from "./presence-indicator"
import EmojiPicker, { EmojiStyle } from "emoji-picker-react"

import { 
  encryptForRecipient, 
  initializeUserEncryption,
  decryptReceivedMessage
} from "@/lib/encryption-manager"

// --- HELPER: Generate real UUIDs ---
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface Message {
  id: string
  sender_id: string
  encrypted_content: string
  encryption_metadata: any
  sender_encrypted_content?: string 
  sender_encryption_metadata?: any  
  created_at: string
  sender_profile?: any
  decryptedDisplay?: string 
}

interface ChatWindowProps {
  conversationId: string
  userId: string
  encryptionReady: boolean
  onBack: () => void // <--- NEW PROP for Mobile Back Button
}

export function ChatWindow({ conversationId, userId, encryptionReady, onBack }: ChatWindowProps) {
  const [supabase] = useState(() => createClient()) 
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [profiles, setProfiles] = useState<Map<string, any>>(new Map())
  const profilesRef = useRef<Map<string, any>>(new Map())
  const [otherUser, setOtherUser] = useState<any>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  
  // State for toggling the picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const getInitials = (name: string) =>
    name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "U"

  /** CORE LOGIC: Decrypts the message based on who looks at it. */
  const processMessage = async (msg: any): Promise<Message> => {
      let display = "[Encrypted Message]"
      try {
        if (msg.sender_id === userId) {
            if (msg.sender_encrypted_content && msg.sender_encryption_metadata) {
                const payload = {
                    ciphertext: msg.sender_encrypted_content,
                    sharedSecret: msg.sender_encryption_metadata.shared_secret,
                    encapsulatedKey: msg.sender_encryption_metadata.encapsulated_key
                }
                display = await decryptReceivedMessage(payload, userId)
            } 
        } else {
            if (msg.encrypted_content && msg.encryption_metadata) {
                const payload = {
                    ciphertext: msg.encrypted_content,
                    sharedSecret: msg.encryption_metadata.shared_secret,
                    encapsulatedKey: msg.encryption_metadata.encapsulated_key
                }
                display = await decryptReceivedMessage(payload, userId)
            }
        }
      } catch (e) {
        console.warn("Decryption failed:", e)
      }
      return { ...msg, decryptedDisplay: display }
  }

  const loadProfiles = async () => {
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", conversationId)

    if (!participants) return

    const userIds = participants.map(p => p.user_id)
    const otherId = userIds.find(id => id !== userId)
    if (!otherId) return

    const { data: profilesData, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, status, public_key") 
      .in("id", userIds)

    if (error) return

    const map = new Map((profilesData || []).map(p => [p.id, p]))
    setProfiles(map)
    profilesRef.current = map
    setOtherUser(map.get(otherId))
  }

  const loadMessages = async () => {
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (!msgs) return

    const processed = await Promise.all(msgs.map(async (m) => {
        const withProfile = {
            ...m,
            sender_profile: profilesRef.current.get(m.sender_id) || { display_name: "Unknown", avatar_url: "/placeholder.svg", status: "offline" }
        }
        return await processMessage(withProfile)
    }))

    setMessages(processed)
  }

  useEffect(() => {
    if (!conversationId) return
    initializeUserEncryption(userId)
    loadProfiles()
  }, [conversationId])

  useEffect(() => {
    if (profiles.size === 0) return
    loadMessages()
  }, [profiles])

  useEffect(() => {
    if (!conversationId) return
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        async (payload: any) => {
          const newMsg = payload.new
          let senderProfile = profilesRef.current.get(newMsg.sender_id)
          if (!senderProfile) {
             const { data } = await supabase.from("profiles").select("*").eq("id", newMsg.sender_id).single()
             senderProfile = data
          }
          const processedMsg = await processMessage({ ...newMsg, sender_profile: senderProfile })
          setMessages(prev => {
             const exists = prev.some(m => m.id === processedMsg.id)
             if (exists) return prev.map(m => m.id === processedMsg.id ? processedMsg : m)
             return [...prev, processedMsg]
          })
        }
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  useEffect(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight
    }
  }, [messages])

  /** SEND MESSAGE */
  const sendMessage = async () => {
    if (!text.trim()) return

    const plainText = text
    setText("") 
    setShowEmojiPicker(false) // Close picker on send

    const messageId = generateUUID()
    const optimisticMsg: any = {
        id: messageId,
        sender_id: userId,
        created_at: new Date().toISOString(),
        sender_profile: profilesRef.current.get(userId),
        decryptedDisplay: plainText, 
        encrypted_content: "", 
        encryption_metadata: {}
    }
    setMessages(prev => [...prev, optimisticMsg])

    try {
        const recipientId = otherUser?.id
        if (!recipientId || !otherUser?.public_key) {
            alert(`Cannot encrypt. ${otherUser?.display_name || "User"} has no public key.`)
            setMessages(prev => prev.filter(m => m.id !== messageId)) 
            setText(plainText)
            return
        }

        const receiverData = await encryptForRecipient(plainText, recipientId)
        const senderData = await encryptForRecipient(plainText, userId)

        const { error } = await supabase.from("messages").insert({
          id: messageId,
          conversation_id: conversationId,
          sender_id: userId,
          encrypted_content: receiverData.ciphertext,
          encryption_metadata: { 
             shared_secret: receiverData.sharedSecret,
             encapsulated_key: receiverData.encapsulatedKey
          },
          sender_encrypted_content: senderData.ciphertext,
          sender_encryption_metadata: {
             shared_secret: senderData.sharedSecret,
             encapsulated_key: senderData.encapsulatedKey
          }
        })
    
        if (error) {
           console.error("Supabase Error:", error)
           setMessages(prev => prev.filter(m => m.id !== messageId)) 
           setText(plainText)
        }
    } catch (err: any) {
        console.error("Encryption failed:", err)
        alert("Encryption failed: " + err.message)
        setMessages(prev => prev.filter(m => m.id !== messageId))
        setText(plainText)
    }
  }

  // Handle adding emoji to text input
  const onEmojiClick = (emojiObject: any) => {
    setText((prev) => prev + emojiObject.emoji)
  }

  return (
    <div className="flex flex-col h-screen w-full bg-white">
      <div className="flex items-center gap-3 border-b p-4 bg-white flex-shrink-0 relative">
        
        {/* --- MOBILE BACK BUTTON --- */}
        <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-1 text-slate-600" 
            onClick={onBack}
        >
            <ArrowLeft className="h-6 w-6" />
        </Button>

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
          <p className="font-semibold flex items-center gap-2">
            {otherUser?.display_name}
            {otherUser?.public_key && <Lock className="h-3 w-3 text-green-500" />}
          </p>
          <p className="text-xs text-slate-500">
            {otherUser?.public_key ? "Kyber-768 Zero-Knowledge" : "Waiting for key..."}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto p-4" viewportRef={viewportRef as any}>
        <div className="flex flex-col gap-2">
          {messages.map(m => {
            const mine = m.sender_id === userId
            const contentToShow = m.decryptedDisplay || "[Encrypted Message]"

            return (
              <div key={m.id} className={`flex max-w-[85%] md:max-w-[70%] gap-2 ${mine ? "flex-row-reverse ml-auto" : "flex-row"}`}>
                <div className="relative hidden md:block">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={m.sender_profile?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{getInitials(m.sender_profile?.display_name)}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <div className={`rounded-2xl px-4 py-2 text-sm ${mine ? "bg-blue-600 text-white rounded-br-none" : "bg-slate-100 text-slate-900 rounded-bl-none"}`}>
                    {/* Render emojis correctly */}
                    {contentToShow}
                    <div className={`mt-1 text-[10px] opacity-70 ${mine ? "text-blue-100" : "text-slate-500"}`}>{format(new Date(m.created_at), "HH:mm")}</div>
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
        className="flex gap-2 border-t p-3 flex-shrink-0 bg-white relative items-center"
      >
        {/* The Picker UI (Absolute position above the bar) */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-0 z-10 shadow-xl border rounded-lg">
            <EmojiPicker 
              onEmojiClick={onEmojiClick} 
              lazyLoadEmojis={true}
              searchDisabled={true} 
              height={350}
              width={300}
            />
          </div>
        )}

        {/* The Emoji Toggle Button */}
        <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-slate-500 hover:text-slate-700"
        >
            <Smile className="h-5 w-5" />
        </Button>

        <Input placeholder="Type a message..." value={text} onChange={e => setText(e.target.value)} />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}