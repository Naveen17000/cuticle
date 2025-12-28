import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-md">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-semibold">Check your email</CardTitle>
            <CardDescription className="text-slate-600">
              We've sent you a confirmation link to verify your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-slate-600">
              Click the link in the email to complete your registration and start using Secure Messenger.
            </p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/login">Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
