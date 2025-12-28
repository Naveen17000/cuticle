"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"
import { addContact } from "@/app/actions/contacts"

interface AddContactDialogProps {
  userId: string
  onContactAdded: () => void
}

export function AddContactDialog({ userId, onContactAdded }: AddContactDialogProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleAddContact = async () => {
    if (!email.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await addContact(email)

      if (result.error) {
        setError(result.error)
      } else {
        setEmail("")
        setOpen(false)
        onContactAdded()
      }
    } catch (err) {
      console.error("[v0] Failed to add contact:", err)
      setError("Failed to add contact")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>Enter the email address of the person you want to connect with.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddContact()
                }
              }}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact} disabled={isLoading || !email.trim()}>
              {isLoading ? "Adding..." : "Add Contact"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
