import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'

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
    .select('credits')
    .eq('id', user.id)
    .single()

  const credits = profile?.credits ?? 0

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Go to Time Hug home"
            tabIndex={0}
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden">
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

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{credits}</span> credits
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl overflow-hidden">
            <Image
              src="/bear-app-icon-png.png"
              alt="Time Hug"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Time Hug!
          </h1>

          <p className="text-gray-600 mb-2">
            You&apos;re signed in as <span className="font-medium">{user.email}</span>
          </p>

          <p className="text-gray-600 mb-8">
            You have <span className="font-semibold text-indigo-600">{credits} credits</span> available.
          </p>

          <div className="bg-indigo-50 rounded-xl p-6">
            <p className="text-indigo-900 font-medium">
              🎉 Generation feature coming soon!
            </p>
            <p className="text-indigo-700 text-sm mt-2">
              You&apos;ll be able to upload photos and create beautiful &quot;hug your younger self&quot; images.
            </p>
          </div>
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
        className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        aria-label="Sign out"
        tabIndex={0}
      >
        Sign Out
      </button>
    </form>
  )
}

