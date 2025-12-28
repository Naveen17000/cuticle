"use client"

import type { User } from "@supabase/supabase-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Settings, Shield, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"

interface UserProfileProps {
  user: User
  profile: any
  encryptionReady: boolean
}

export function UserProfile({ user, profile, encryptionReady }: UserProfileProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="border-b border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-blue-600 text-white">
              {getInitials(profile?.display_name || user.email || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{profile?.display_name || "User"}</p>
            <div className="flex items-center gap-1">
              {encryptionReady ? (
                <>
                  <ShieldCheck className="h-3 w-3 text-green-600" />
                  <p className="text-xs text-green-600">Encrypted</p>
                </>
              ) : (
                <>
                  <Shield className="h-3 w-3 text-slate-400" />
                  <p className="text-xs text-slate-400">Setting up...</p>
                </>
              )}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
