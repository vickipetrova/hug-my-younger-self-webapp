import Image from "next/image";
import Link from "next/link";

const BRAND_NAME = "Time Hug";
const HEADLINE = "Create a \"Hug My Younger Self\" Photo";
const SUBHEAD =
  "Time Hug is a simple, nostalgic photo app to reunite with your younger self. Turn two photos into one hug.";
const TW_HANDLE = "@vicki_petrovaa";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f7f9] text-gray-900">
      <main className="mx-auto max-w-7xl px-6 md:px-10 py-16 md:py-24">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left column */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              {/* App icon */}
              <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center">
                <Image
                  src="/bear-app-icon-png.png"
                  alt="Time Hug app icon"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <span
                className="text-xl md:text-2xl font-semibold"
                aria-label="Brand name"
              >
                {BRAND_NAME}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {HEADLINE}
            </h1>

            <p className="mt-5 text-lg text-gray-600">{SUBHEAD}</p>

            {/* Auth buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 transition-colors"
                aria-label="Sign up for Time Hug"
                tabIndex={0}
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-gray-900 font-semibold text-base ring-1 ring-gray-300 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 transition-colors"
                aria-label="Log in to Time Hug"
                tabIndex={0}
              >
                Log In
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Create your first hug in minutes.
            </p>

            <p className="mt-4 text-sm">
              <a
                href={`https://twitter.com/${TW_HANDLE.replace(/^@/, "")}`}
                className="text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
                aria-label={`Follow ${TW_HANDLE} for updates`}
                tabIndex={0}
              >
                Follow {TW_HANDLE}
              </a>
            </p>
          </div>

          {/* Right column */}
          <div className="relative">
            <div className="relative mx-auto max-w-sm rounded-2xl shadow-xl ring-1 ring-black/10 overflow-hidden bg-black">
              <video
                src="/time-hug-demo.mov"
                className="w-full h-auto"
                autoPlay
                muted
                loop
                playsInline
                controls
                aria-label="Time Hug demo video"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
