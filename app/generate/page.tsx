import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { GenerateClient } from '@/components/GenerateClient'

const DEFAULT_CREDIT_COST = 1

export default async function GeneratePage() {
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

  // Fetch active template
  const { data: template } = await supabase
    .from('templates')
    .select('id, name, description, credit_cost')
    .eq('slug', 'hug-younger-self')
    .eq('is_active', true)
    .single()

  const credits = profile?.credit_balance ?? 0

  // Template data with defaults
  const templateData = {
    id: template?.id ?? '',
    name: template?.name ?? 'Hug My Younger Self',
    description: template?.description ?? 'Upload two photos to create a magical moment where you hug your younger self.',
    creditCost: template?.credit_cost ?? DEFAULT_CREDIT_COST,
  }

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
              href="/history"
              className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
              tabIndex={0}
              aria-label="View generation history"
            >
              History
            </Link>

            <SignOutButton />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl ring-1 ring-black/5 p-8 sm:p-12">
          <GenerateClient userId={user.id} credits={credits} template={templateData} />
        </div>
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
