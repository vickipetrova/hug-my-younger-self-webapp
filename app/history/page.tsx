import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { HistoryGallery } from '@/components/HistoryGallery'

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile for credits
  const { data: profile } = await supabase
    .from('profiles')
    .select('credit_balance')
    .eq('id', user.id)
    .single()

  // Fetch user's generations
  const { data: generations } = await supabase
    .from('generations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const credits = profile?.credit_balance ?? 0

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            aria-label="Go to Time Hug home"
            tabIndex={0}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm">
              <Image
                src="/bear-app-icon-png.png"
                alt="Time Hug app icon"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="text-lg font-semibold text-gray-900">Time Hug</span>
          </Link>

          <nav className="flex items-center gap-6">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-indigo-600">{credits}</span> credits
            </div>

            <Link
              href="/generate"
              className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              tabIndex={0}
              aria-label="Create new generation"
            >
              Generate
            </Link>

            <SignOutButton />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Time Hugs</h1>
          <p className="text-gray-600">Browse your past generations and download your favorites.</p>
        </div>

        <HistoryGallery generations={generations || []} />
      </main>
    </div>
  )
}

const SignOutButton = () => {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
        aria-label="Sign out"
        tabIndex={0}
      >
        Sign Out
      </button>
    </form>
  )
}

