import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",        // Homepage
  "/login",   // Login page
  "/signup",  // Signup page
  "/auth",    // Auth callback routes (for OAuth, email confirmation, etc.)
];

/**
 * Helper function to check if a path is public
 */
const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some((route) => {
    // Exact match for root
    if (route === "/") return pathname === "/";
    // StartsWith match for other routes (e.g., /auth/callback)
    return pathname.startsWith(route);
  });
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  /**
   * CREATING THE SUPABASE CLIENT
   *
   * We create a fresh client for each request because:
   * - Each request might have different cookies
   * - We need to read/write cookies for THIS specific request
   * - Reusing a global client could cause cookie conflicts
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        /**
         * getAll: Reads ALL cookies from the incoming request
         * Supabase needs this to find the auth token cookie
         */
        getAll() {
          return request.cookies.getAll();
        },
        /**
         * setAll: Writes cookies to BOTH the request and response
         *
         * Why both?
         * - Request cookies: So subsequent code in this request sees the new values
         * - Response cookies: So the browser saves the new values for future requests
         */
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  /**
   * GET CLAIMS = "Who is this user?"
   *
   * This call does several things:
   * 1. Reads the auth token from cookies
   * 2. Validates it's not expired/tampered
   * 3. If expired, tries to refresh it using the refresh token
   * 4. Returns the user's "claims" (their ID, email, role, etc.)
   *
   * IMPORTANT: Don't add code between createServerClient and getClaims()
   * It could interfere with the cookie handling and cause random logouts.
   */
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;
  const pathname = request.nextUrl.pathname;

  /**
   * ROUTE PROTECTION LOGIC
   *
   * If: No user is logged in AND they're trying to access a private route
   * Then: Redirect them to the login page
   *
   * Otherwise: Let them through (they're either logged in, or on a public page)
   */
  if (!user && !isPublicRoute(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  /**
   * REDIRECT LOGGED-IN USERS AWAY FROM AUTH PAGES
   *
   * If: User is logged in AND they're trying to access /login or /signup
   * Then: Redirect them to /generate (they're already authenticated)
   */
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/generate";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}