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

    setupEncryption()
  }, [user.id])

  useEffect(() => {
    const cleanup = startPresenceTracking(user.id)
    return cleanup
  }, [user.id])

  const handleContactAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleStartConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="flex w-80 flex-col border-r border-slate-200 bg-white">
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

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {selectedConversationId ? (
          <ChatWindow
            key={selectedConversationId}
            conversationId={selectedConversationId}
            userId={user.id}
            encryptionReady={encryptionReady}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-500">
            <div className="text-center">
              <p className="text-lg font-medium">Select a conversation to start messaging</p>
              <p className="mt-2 text-sm">Your messages are protected with post-quantum encryption</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
