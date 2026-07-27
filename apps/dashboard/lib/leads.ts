import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

/**
 * Lead sinks for the "Book a demo" form. Each sink is independent and
 * best-effort: a lead is persisted first, then notifications fire. A sink that
 * isn't configured (env vars absent) is simply skipped, so the form works in
 * local dev with zero setup and lights up sink-by-sink as env vars are added.
 */

export interface Lead {
  name: string;
  email: string;
  company: string;
  crews: string | null;
  notes: string | null;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referer: string | null;
}

export interface SinkResult {
  persisted: boolean;
  emailed: boolean;
  texted: boolean;
  /** True if at least one configured sink accepted the lead. */
  delivered: boolean;
  errors: string[];
}

const env = (k: string) => process.env[k]?.trim() || undefined;

/** Persist to the Supabase `leads` table via the service-role key (bypasses RLS). */
async function persist(lead: Lead, errors: string[]): Promise<boolean> {
  const url = env('SUPABASE_URL') ?? env('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return false;

  try {
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { error } = await supabase.from('leads').insert({
      name: lead.name,
      email: lead.email,
      company: lead.company,
      crews: lead.crews,
      notes: lead.notes,
      source: lead.source,
      utm_source: lead.utm_source,
      utm_medium: lead.utm_medium,
      utm_campaign: lead.utm_campaign,
      referer: lead.referer,
    });
    if (error) throw new Error(error.message);
    return true;
  } catch (e) {
    errors.push(`supabase: ${(e as Error).message}`);
    return false;
  }
}

/** Instant email alert to the Solarsearch sales inbox via Resend. */
async function email(lead: Lead, errors: string[]): Promise<boolean> {
  const apiKey = env('RESEND_API_KEY');
  const to = env('LEAD_ALERT_TO');
  const from = env('LEAD_ALERT_FROM') ?? 'Solarsafe Leads <onboarding@resend.dev>';
  if (!apiKey || !to) return false;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: to.split(',').map((s) => s.trim()),
      replyTo: lead.email,
      subject: `New demo request — ${lead.company} (${lead.crews ?? 'crew size n/a'})`,
      html: renderEmail(lead),
    });
    if (error) throw new Error(error.message);
    return true;
  } catch (e) {
    errors.push(`resend: ${(e as Error).message}`);
    return false;
  }
}

/**
 * Instant SMS alert via Kudosity (formerly Burst SMS / TransmitSMS).
 * Endpoint + Basic auth per the Kudosity REST API. Drop-in: activates the
 * moment KUDOSITY_API_KEY / _SECRET / _ALERT_TO are set.
 */
async function sms(lead: Lead, errors: string[]): Promise<boolean> {
  const key = env('KUDOSITY_API_KEY');
  const secret = env('KUDOSITY_API_SECRET');
  const to = env('KUDOSITY_ALERT_TO');
  if (!key || !secret || !to) return false;

  const base = env('KUDOSITY_API_BASE') ?? 'https://api.transmitsms.com';
  const from = env('KUDOSITY_SENDER'); // optional dedicated sender/virtual number
  const body = new URLSearchParams({
    message: `New Solarsafe demo lead: ${lead.company} · ${lead.crews ?? 'crew size n/a'} · ${lead.name}`,
    to,
  });
  if (from) body.set('from', from);

  try {
    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const res = await fetch(`${base}/send-sms.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { error?: { code?: string; description?: string } };
    if (json.error && json.error.code && json.error.code !== 'SUCCESS') {
      throw new Error(json.error.description ?? json.error.code);
    }
    return true;
  } catch (e) {
    errors.push(`kudosity: ${(e as Error).message}`);
    return false;
  }
}

export async function deliverLead(lead: Lead): Promise<SinkResult> {
  const errors: string[] = [];
  const [persisted, emailed, texted] = await Promise.all([
    persist(lead, errors),
    email(lead, errors),
    sms(lead, errors),
  ]);

  const anyConfigured = persisted || emailed || texted || errors.length > 0;
  if (!anyConfigured) {
    // No sink configured (local dev): don't drop the lead silently.
    console.info('[lead] no sink configured — logging only', lead);
  }

  return {
    persisted,
    emailed,
    texted,
    delivered: persisted || emailed || texted || !anyConfigured,
    errors,
  };
}

function esc(s: string | null): string {
  if (!s) return '—';
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

function renderEmail(lead: Lead): string {
  const row = (label: string, value: string | null) =>
    `<tr><td style="padding:6px 14px 6px 0;color:#55617a;font-size:13px">${label}</td>` +
    `<td style="padding:6px 0;color:#0d1526;font-size:14px;font-weight:600">${esc(value)}</td></tr>`;
  return `
  <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,sans-serif;max-width:520px">
    <div style="background:#0d1526;color:#fff;padding:18px 20px;border-radius:12px 12px 0 0">
      <div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#f5a524">New demo request</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px">${esc(lead.company)}</div>
    </div>
    <div style="border:1px solid #e6eaf3;border-top:none;padding:18px 20px;border-radius:0 0 12px 12px">
      <table style="border-collapse:collapse;width:100%">
        ${row('Name', lead.name)}
        ${row('Email', lead.email)}
        ${row('Company', lead.company)}
        ${row('Crews', lead.crews)}
        ${row('Notes', lead.notes)}
        ${row('Source', lead.utm_source ?? lead.source)}
        ${row('Campaign', lead.utm_campaign)}
        ${row('Referrer', lead.referer)}
      </table>
      <div style="margin-top:16px;font-size:12px;color:#8a93a8">Reply directly to this email to reach the lead.</div>
    </div>
  </div>`;
}
