import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient(useServiceRole = false) {
  const key = useServiceRole ? process.env.SUPABASE_SERVICE_ROLE_KEY! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // When using the service role, do NOT attach user cookies. This ensures
  // the client authenticates as the service role and bypasses RLS as intended.
  if (useServiceRole) {
    // createServerClient requires cookie handlers; provide no-op handlers
    // so the client initializes but doesn't read user cookies.
    return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
      cookies: {
        getAll() {
          return []
        },
        setAll(_: any[]) {
          // no-op
        },
      },
    })
  }

  const cookieStore = await cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have proxy refreshing user sessions.
        }
      },
    },
  })
}
