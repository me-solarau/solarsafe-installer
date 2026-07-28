'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase client for the employer dashboard.
 *
 * Security note: this uses the PUBLISHABLE (anon) key, which is designed to be
 * public. Every table in the installer project has RLS enabled with policies
 * scoped to `authenticated`, so the database — not the client — is what keeps
 * one company's evidence away from another. The company evidence firewall is an
 * RLS concern (spec Ground rule #6); never rely on the UI to enforce it.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY (see apps/dashboard/.env.example).',
    );
  }
  if (!client) client = createClient(url, key);
  return client;
}

export const isSupabaseConfigured = Boolean(url && key);
