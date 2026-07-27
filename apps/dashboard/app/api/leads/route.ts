import { NextResponse } from 'next/server';
import { deliverLead, type Lead } from '@/lib/leads';

/**
 * Lead capture endpoint for the marketing site's "Book a demo" form.
 *
 * Pipeline: validate → spam guard (honeypot) → deliver to configured sinks
 * (Supabase table + Resend email + Kudosity SMS). Sinks are best-effort and
 * independent; the lead is accepted as long as at least one sink takes it
 * (or none is configured, in local dev).
 */

export const runtime = 'nodejs';

interface LeadPayload {
  name?: string;
  email?: string;
  company?: string;
  crews?: string;
  notes?: string;
  // honeypot — real users never fill this; bots do.
  company_website?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referer?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (s: string | undefined, max: number) => s?.trim().slice(0, max) || undefined;

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Honeypot: silently accept and drop so bots get no signal.
  if (body.company_website && body.company_website.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const name = clip(body.name, 120);
  const email = clip(body.email, 200);
  const company = clip(body.company, 160);

  if (!name || !company || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: 'name, company and a valid email are required' },
      { status: 422 },
    );
  }

  const lead: Lead = {
    name,
    email,
    company,
    crews: clip(body.crews, 40) ?? null,
    notes: clip(body.notes, 2000) ?? null,
    source: 'marketing_site',
    utm_source: clip(body.utm_source, 120) ?? null,
    utm_medium: clip(body.utm_medium, 120) ?? null,
    utm_campaign: clip(body.utm_campaign, 120) ?? null,
    referer: clip(body.referer, 500) ?? request.headers.get('referer') ?? null,
  };

  const result = await deliverLead(lead);

  if (!result.delivered) {
    console.error('[lead] delivery failed', result.errors);
    return NextResponse.json({ error: 'Could not record your request' }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
