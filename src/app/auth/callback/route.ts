import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'
  const claimId = searchParams.get('claim_id')

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session) {
      if (claimId) {
        // Attempt to claim the form for the newly logged-in user
        // The RLS policy "Allow claiming guest forms" ensures this only works for forms with user_id = null
        await supabase
          .from('forms')
          .update({ user_id: session.user.id })
          .eq('id', claimId)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/?error=auth-callback-failed`)
}
