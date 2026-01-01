"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConversationList } from "./conversation-list"
import { ContactsTab } from "./contacts-tab"
import { ChatWindow } from "./chat-window"
import { UserProfile } from "./user-profile"
import { AddContactDialog } from "./add-contact-dialog"
import { initializeUserEncryption, hasEncryptionKeys } from "@/lib/encryption-manager"
import { startPresenceTracking } from "@/lib/presence-manager"

interface MessengerLayoutProps {
  user: User
  profile: any
  conversationIds: string[]
}

export function MessengerLayout({ user, profile, conversationIds }: MessengerLayoutProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [encryptionReady, setEncryptionReady] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  
  // 1. Add 'isMounted' to track if we are on the client
  const [isMounted, setIsMounted] = useState(false)

  const isChatOpen = !!selectedConversationId

  // 2. Set isMounted to true immediately after component loads
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const setupEncryption = async () => {
      try {
        if (!hasEncryptionKeys(user.id)) {
          console.log("[v0] Initializing encryption for first time...")
          await initializeUserEncryption(user.id)
        }
        setEncryptionReady(true)
      } catch (error) {
        console.error("[v0] Failed to initialize encryption:", error)
      }
    }

    if (isMounted) {
      setupEncryption()
    }
  }, [user.id, isMounted])

  useEffect(() => {
    if (!isMounted) return
    const cleanup = startPresenceTracking(user.id)
    return cleanup
  }, [user.id, isMounted])

  const handleContactAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleStartConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    setRefreshKey((prev) => prev + 1)
  }

  // 3. PREVENT HYDRATION MISMATCH
  // If we are not mounted yet (Server Side), render a static fallback.
  // This prevents Radix UI from generating mismatched IDs.
  if (!isMounted) {
    return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <div className="w-full md:w-80 border-r border-slate-200 bg-white flex flex-col">
           {/* Static Header Placeholder */}
           <div className="p-4 border-b h-[73px]" /> 
           <div className="p-4">Loading chats...</div>
        </div>
        <div className="hidden md:flex flex-1 bg-slate-50 items-center justify-center">
           {/* Static Content Placeholder */}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* SIDEBAR */}
      <div className={`
        flex-col border-r border-slate-200 bg-white
        w-full md:w-80 
        ${isChatOpen ? 'hidden md:flex' : 'flex'}
      `}>
        <UserProfile user={user} profile={profile} encryptionReady={encryptionReady} />

        <Tabs defaultValue="conversations" className="flex flex-1 flex-col">
          <div className="border-b border-slate-200 px-4">
            <TabsList className="w-full">
              <TabsTrigger value="conversations" className="flex-1">
                Messages
              </TabsTrigger>
              <TabsTrigger value="contacts" className="flex-1">
                Contacts
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="conversations" className="flex-1 m-0">
            <div className="flex flex-col h-full">
              <div className="border-b border-slate-200 p-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">Recent Chats</h2>
                <AddContactDialog userId={user.id} onContactAdded={handleContactAdded} />
              </div>
              <ConversationList
                key={refreshKey}
                userId={user.id}
                selectedConversationId={selectedConversationId}
                onSelectConversation={setSelectedConversationId}
              />
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="flex-1 m-0">
            <ContactsTab userId={user.id} onStartConversation={handleStartConversation} />
          </TabsContent>
        </Tabs>
      </div>

      {/* MAIN CHAT AREA */}
      <div className={`
        flex-1 flex-col
        ${isChatOpen ? 'flex' : 'hidden md:flex'}
      `}>
        {selectedConversationId ? (
          <ChatWindow
            key={selectedConversationId}
            conversationId={selectedConversationId}
            userId={user.id}
            encryptionReady={encryptionReady}
            onBack={() => setSelectedConversationId(null)}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-500 bg-slate-50/50">
            <div className="text-center p-6">
               <div className="bg-slate-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center text-3xl">
                  👋
               </div>
              <p className="text-lg font-medium text-slate-900">Select a conversation</p>
              <p className="mt-2 text-sm max-w-xs mx-auto">
                Your messages are protected with post-quantum Kyber-768 encryption.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}