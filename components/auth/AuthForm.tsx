import Image from 'next/image'
import Link from 'next/link'

type AuthFormProps = {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export const AuthForm = ({ children, title, subtitle }: AuthFormProps) => {
  return (
    <div className="min-h-screen bg-[#f6f7f9] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center gap-3 mb-8"
          aria-label="Go to Time Hug home"
          tabIndex={0}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden">
            <Image
              src="/bear-app-icon-png.png"
              alt="Time Hug app icon"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <span className="text-xl font-semibold text-gray-900">Time Hug</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}

