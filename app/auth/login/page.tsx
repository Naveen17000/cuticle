"use client"

import type React from "react"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Shield } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/messenger")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Secure Messenger</h1>
          <p className="mt-2 text-sm text-slate-600">Post-quantum encrypted communications</p>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Sign in</CardTitle>
            <CardDescription className="text-slate-600">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-300"
                />
              </div>
              {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-700">
                Create one
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
