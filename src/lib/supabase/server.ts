import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/**
 * Supabase client for server components and route handlers.
 *
 * The session lives in an httpOnly cookie, which is why this client has to be
 * built per request: it reads that cookie to know who is asking, and writes a
 * refreshed one back when the token is about to expire. A single shared client
 * would mix up visitors.
 *
 * `server-only` makes an accidental import from a client component fail at
 * build time rather than shipping session handling to the browser.
 */
export async function getServerSupabase() {
  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server components may not set cookies. Refreshing the session is
          // the middleware's job (see `src/middleware.ts`), so ignoring this
          // here is safe — it is not a failed login.
        }
      },
    },
  });
}

/**
 * The signed-in user, or null. Uses `getUser()` rather than `getSession()`:
 * `getSession` returns whatever the cookie claims, while `getUser` has Supabase
 * verify the token. For anything that decides what someone may see or change,
 * only the verified answer counts.
 */
export async function getCurrentUser() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
