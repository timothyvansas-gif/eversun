"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/**
 * Supabase client for browser code.
 *
 * Only for reading the current session and starting a login. Booking data is
 * never fetched straight from the browser: it goes through the route handlers
 * in `src/app/api`, so validation and the studio's rules live in one place.
 */

let cached: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserSupabase() {
  if (cached) return cached;

  const { url, publishableKey } = getSupabaseEnv();
  cached = createBrowserClient(url, publishableKey);
  return cached;
}
