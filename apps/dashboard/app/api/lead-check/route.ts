import { NextResponse } from 'next/server';
import { deliverLead } from '@/lib/leads';

/**
 * Diagnostic. Default GET reports which lead-sink env vars are visible
 * (booleans only, never values). GET ?run=1 actually fires the sinks with a
 * test payload and returns the per-sink result + exact error messages, so we
 * can see precisely why a sink fails on the live deployment. Safe to remove
 * once lead capture is verified.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const present = (k: string) => Boolean(process.env[k]?.trim());

export async function GET(request: Request) {
  const presence = {
    supabase_url: present('SUPABASE_URL') || present('NEXT_PUBLIC_SUPABASE_URL'),
    supabase_service_role_key: present('SUPABASE_SERVICE_ROLE_KEY'),
    resend_api_key: present('RESEND_API_KEY'),
    lead_alert_to: present('LEAD_ALERT_TO'),
    deployment: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'unknown',
    env: process.env.VERCEL_ENV ?? 'unknown',
  };

  if (new URL(request.url).searchParams.get('run') !== '1') {
    return NextResponse.json(presence);
  }

  const result = await deliverLead({
    name: 'Diagnostic Check',
    email: 'diagnostic@solarsearch.com.au',
    company: 'DIAGNOSTIC — safe to delete',
    crews: null,
    notes: 'Automated /api/lead-check?run=1 test.',
    source: 'diagnostic',
    utm_source: 'lead_check',
    utm_medium: null,
    utm_campaign: null,
    referer: null,
  });

  return NextResponse.json({ presence, result });
}
