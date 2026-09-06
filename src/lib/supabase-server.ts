import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the service role key, which must NEVER reach the
// browser. Every table has RLS enabled with no public policies, so only this
// client (used inside API routes / server components) can read or write data.
export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase server env vars");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
