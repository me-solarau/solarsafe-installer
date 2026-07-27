import { NextResponse } from 'next/server';

/**
 * Lead capture endpoint for the marketing site's "Book a demo" form.
 *
 * v1 (this scaffold): validates the payload and logs it server-side so the
 * form is functional end-to-end. Wiring to a CRM / Slack / email (or a
 * Supabase `leads` table) is a follow-up — deliberately kept out of the
 * evidence schema, since marketing leads are not job evidence.
 */

interface LeadPayload {
  name?: string;
  email?: string;
  company?: string;
  crews?: string;
  notes?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const company = body.company?.trim();

  if (!name || !company || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: 'name, company and a valid email are required' },
      { status: 422 },
    );
  }

  const lead = {
    name,
    email,
    company,
    crews: body.crews?.trim() || null,
    notes: body.notes?.trim() || null,
    received_at: new Date().toISOString(),
    source: 'marketing_site',
  };

  // TODO(phase-1): persist to a CRM / notify sales. For now, server log only.
  console.info('[lead] new demo request', lead);

  return NextResponse.json({ ok: true }, { status: 201 });
}
