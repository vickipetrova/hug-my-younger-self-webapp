import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * MIDDLEWARE EXPLAINED:
 *
 * This file is special in Next.js. When placed at the root of your project,
 * Next.js automatically runs the `middleware()` function BEFORE every request.
 *
 * Think of it like a bouncer at a club:
 * 1. User tries to visit /dashboard
 * 2. Middleware intercepts the request FIRST
 * 3. Middleware checks: "Are you logged in?"
 * 4. If yes → let them through to /dashboard
 * 5. If no → redirect them to /login
 *
 * WHY WE NEED THIS FOR SUPABASE:
 * - Supabase stores auth sessions in cookies
 * - Cookies expire and need to be "refreshed" periodically
 * - The middleware refreshes the session on every request
 * - Without this, users would randomly get logged out!
 */
export const middleware = async (request: NextRequest) => {
  return await updateSession(request);
};

/**
 * MATCHER CONFIG EXPLAINED:
 *
 * The `matcher` tells Next.js: "Only run middleware on these paths"
 *
 * This regex pattern EXCLUDES:
 * - /_next/static/* → Static files (CSS, JS bundles)
 * - /_next/image/* → Optimized images
 * - /favicon.ico → Browser tab icon
 * - /*.svg, /*.png, etc. → Image files in /public
 *
 * WHY EXCLUDE THESE?
 * - They don't need auth checks (they're just files)
 * - Running middleware on them wastes resources
 * - It would slow down your app for no reason
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mov)$).*)",
  ],
};

