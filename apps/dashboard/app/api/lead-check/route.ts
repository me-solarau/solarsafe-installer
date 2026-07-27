import { NextResponse } from 'next/server';

/**
 * Diagnostic: reports which lead-sink env vars are visible to the running
 * server, as booleans only (never the values). Lets us confirm env wiring on
 * a live deployment without exposing secrets. Safe to remove once verified.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const present = (k: string) => Boolean(process.env[k]?.trim());

export async function GET() {
  return NextResponse.json({
    supabase_url: present('SUPABASE_URL') || present('NEXT_PUBLIC_SUPABASE_URL'),
    supabase_service_role_key: present('SUPABASE_SERVICE_ROLE_KEY'),
    resend_api_key: present('RESEND_API_KEY'),
    lead_alert_to: present('LEAD_ALERT_TO'),
    deployment: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'unknown',
    env: process.env.VERCEL_ENV ?? 'unknown',
  });
}
