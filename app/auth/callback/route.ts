import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/generate'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`, { status: 302 })
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`, { status: 302 })
      } else {
        return NextResponse.redirect(`${origin}${next}`, { status: 302 })
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`, { status: 302 })
}

// Ensure this route is always dynamic
export const dynamic = 'force-dynamic'

