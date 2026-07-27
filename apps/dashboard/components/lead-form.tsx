'use client';

import { useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const crewSizes = ['1–5 crews', '6–20 crews', '21–50 crews', '50+ crews'];

export function LeadForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // Attribution: capture UTM params + referrer so sales knows the channel.
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      for (const key of ['utm_source', 'utm_medium', 'utm_campaign']) {
        const v = params.get(key);
        if (v) (data as Record<string, string>)[key] = v;
      }
      if (document.referrer) (data as Record<string, string>).referer = document.referrer;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
      setMessage("Thanks — we'll be in touch within one business day to set up your demo.");
      form.reset();
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Email hello@solarsafe.installer and we\'ll sort it.');
    }
  }

  if (status === 'success') {
    return (
      <div className="card border-verify-600/30 bg-verify-600/5" role="status">
        <div className="flex items-center gap-2 text-verify-700">
          <CheckIcon />
          <span className="font-semibold">Request received</span>
        </div>
        <p className="mt-2 text-sm text-ink-700">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-4" noValidate>
      {/* Honeypot — hidden from humans, tempting to bots. Leave it empty. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" autoComplete="name" required />
        <Field label="Work email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company" name="company" autoComplete="organization" required />
        <div className="grid gap-1.5">
          <label htmlFor="crews" className="text-sm font-medium text-ink-900">
            Crews you run
          </label>
          <select
            id="crews"
            name="crews"
            className="rounded-lg border border-ink-100 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-solar-500 focus:outline-none focus:ring-2 focus:ring-solar-500/30"
            defaultValue=""
          >
            <option value="" disabled>
              Select…
            </option>
            {crewSizes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-ink-900">
          What are you hoping to fix? <span className="font-normal text-ink-700/60">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="e.g. audit exposure on STC claims, subbie quality drift, paperwork across four portals…"
          className="rounded-lg border border-ink-100 bg-white px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-700/40 focus:border-solar-500 focus:outline-none focus:ring-2 focus:ring-solar-500/30"
        />
      </div>
      <button type="submit" className="btn-primary w-full" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Book my demo'}
      </button>
      {status === 'error' && (
        <p className="text-sm text-red-600" role="alert">
          {message}
        </p>
      )}
      <p className="text-center text-xs text-ink-700/60">
        No credit card. We&apos;ll show you a real pilot job — not a canned deck.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-ink-900">
        {label}
        {required && <span className="text-solar-600"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="rounded-lg border border-ink-100 bg-white px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-700/40 focus:border-solar-500 focus:outline-none focus:ring-2 focus:ring-solar-500/30"
      />
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
      <path d="M8 12.5l2.5 2.5 5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
