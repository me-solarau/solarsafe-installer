'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Company, Qualification, SeatStatus } from '@solarsafe/shared';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase-browser';

/**
 * Employer dashboard — Phase 1 (accounts & seats).
 *
 * Roster of seats, plus invitation. All access is enforced by RLS in the
 * database (policies scoped to `authenticated`); this page is a thin client
 * over it, never the security boundary.
 */

interface SeatRow {
  id: string;
  status: SeatStatus;
  consent_at: string | null;
  billing_anchor_at: string | null;
  created_at: string;
  installers: {
    id: string;
    full_name: string;
    email: string | null;
    auth_user_id: string | null;
    qualifications: Qualification[];
  } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [company, setCompany] = useState<Company | null>(null);
  const [seats, setSeats] = useState<SeatRow[]>([]);

  const load = useCallback(async () => {
    setError('');
    const supabase = getSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.replace('/login');
      return;
    }

    const { data: companies, error: cErr } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_user_id', auth.user.id)
      .order('created_at')
      .limit(1);
    if (cErr) { setError(cErr.message); setLoading(false); return; }

    const co = (companies?.[0] as Company | undefined) ?? null;
    setCompany(co);

    if (co) {
      const { data: rows, error: sErr } = await supabase
        .from('company_installer_links')
        .select(
          'id,status,consent_at,billing_anchor_at,created_at,' +
            'installers(id,full_name,email,auth_user_id,qualifications(*))',
        )
        .eq('company_id', co.id)
        .order('created_at', { ascending: false });
      if (sErr) setError(sErr.message);
      else setSeats((rows ?? []) as unknown as SeatRow[]);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    void load();
  }, [load]);

  if (!isSupabaseConfigured) {
    return (
      <div className="container-page py-16">
        <div className="card max-w-lg">
          <h1 className="text-xl font-bold text-ink-900">Dashboard isn&apos;t configured</h1>
          <p className="mt-2 text-sm text-ink-700">
            Missing <code>NEXT_PUBLIC_SUPABASE_URL</code> /{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. See{' '}
            <code>apps/dashboard/.env.example</code>.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="container-page py-16 text-sm text-ink-700">Loading…</div>;
  }

  return (
    <div className="container-page py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow">Employer dashboard</span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">
            {company ? company.name : 'Set up your company'}
          </h1>
        </div>
        <button
          className="btn-ghost"
          onClick={async () => {
            await getSupabase().auth.signOut();
            router.replace('/login');
          }}
        >
          Sign out
        </button>
      </header>

      {error && (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {!company ? (
        <CreateCompany onCreated={load} />
      ) : (
        <>
          <InviteInstaller companyId={company.id} onInvited={load} />
          <Roster seats={seats} />
        </>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- create co */

function CreateCompany({ onCreated }: { onCreated: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    try {
      const supabase = getSupabase();
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error('Not signed in.');
      const { error } = await supabase.from('companies').insert({
        name: String(fd.get('name') || '').trim(),
        abn: String(fd.get('abn') || '').trim() || null,
        owner_user_id: auth.user.id,
      });
      if (error) throw error;
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mt-8 grid max-w-lg gap-4">
      <p className="text-sm text-ink-700">
        Create your company account. You&apos;ll be its admin — all jobs, evidence and
        telemetry belong to it, firewalled from every other company.
      </p>
      <div className="grid gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-ink-900">Company name *</label>
        <input id="name" name="name" required
          className="rounded-lg border border-ink-100 px-3 py-2.5 text-sm focus:border-solar-500 focus:outline-none focus:ring-2 focus:ring-solar-500/30" />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="abn" className="text-sm font-medium text-ink-900">ABN</label>
        <input id="abn" name="abn"
          className="rounded-lg border border-ink-100 px-3 py-2.5 text-sm focus:border-solar-500 focus:outline-none focus:ring-2 focus:ring-solar-500/30" />
      </div>
      <button className="btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create company'}</button>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
    </form>
  );
}

/* ------------------------------------------------------------------ invite */

function InviteInstaller({ companyId, onInvited }: { companyId: string; onInvited: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(''); setResult('');
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const { data, error } = await getSupabase().rpc('invite_installer', {
        p_company_id: companyId,
        p_email: String(fd.get('email') || '').trim(),
        p_full_name: String(fd.get('full_name') || '').trim() || null,
      });
      if (error) throw error;
      const r = data as { installer_existed?: boolean; already_linked?: boolean };
      setResult(
        r?.already_linked
          ? 'That installer already holds a seat with you.'
          : r?.installer_existed
            ? 'Invitation sent — they already have a Solarsafe login, so it’ll appear in their app.'
            : 'Invitation created. They’ll claim it when they sign up with that email.',
      );
      form.reset();
      onInvited();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card mt-8">
      <h2 className="text-lg font-semibold text-ink-900">Invite an installer</h2>
      <p className="mt-1 text-sm text-ink-700">
        A seat is billable only once they accept and record consent. One login per human —
        if they already have a Solarsafe identity, this invites that identity rather than
        creating a second one.
      </p>
      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="grid gap-1.5">
          <label htmlFor="inv_email" className="text-sm font-medium text-ink-900">Email *</label>
          <input id="inv_email" name="email" type="email" required
            className="rounded-lg border border-ink-100 px-3 py-2.5 text-sm focus:border-solar-500 focus:outline-none focus:ring-2 focus:ring-solar-500/30" />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="inv_name" className="text-sm font-medium text-ink-900">Name</label>
          <input id="inv_name" name="full_name"
            className="rounded-lg border border-ink-100 px-3 py-2.5 text-sm focus:border-solar-500 focus:outline-none focus:ring-2 focus:ring-solar-500/30" />
        </div>
        <button className="btn-primary" disabled={busy}>{busy ? 'Inviting…' : 'Send invite'}</button>
      </form>
      {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
      {result && <p className="mt-3 text-sm text-verify-700" role="status">{result}</p>}
    </section>
  );
}

/* ------------------------------------------------------------------ roster */

const STATUS_STYLE: Record<SeatStatus, string> = {
  invited: 'bg-solar-500/15 text-solar-700',
  active: 'bg-verify-500/15 text-verify-700',
  deactivated: 'bg-ink-100 text-ink-700',
};

function Roster({ seats }: { seats: SeatRow[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-ink-900">
        Roster <span className="font-normal text-ink-700">({seats.length})</span>
      </h2>

      {seats.length === 0 ? (
        <p className="card mt-4 text-sm text-ink-700">
          No seats yet. Invite your first installer above.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-100">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-ink-50 text-xs uppercase tracking-wide text-ink-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Installer</th>
                <th className="px-4 py-3 font-semibold">Seat</th>
                <th className="px-4 py-3 font-semibold">Qualifications</th>
                <th className="px-4 py-3 font-semibold">Consent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {seats.map((s) => {
                const inst = s.installers;
                const quals = inst?.qualifications ?? [];
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink-900">{inst?.full_name ?? '—'}</div>
                      <div className="text-xs text-ink-700">{inst?.email ?? '—'}</div>
                      {!inst?.auth_user_id && (
                        <div className="mt-1 text-xs text-ink-700/70">Hasn’t signed up yet</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${STATUS_STYLE[s.status]}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {quals.length === 0 ? (
                        <span className="text-ink-700">—</span>
                      ) : (
                        <ul className="space-y-1">
                          {quals.map((q) => (
                            <li key={q.id} className="text-xs">
                              <span className="font-semibold text-ink-900">
                                {q.type === 'electrical_licence' ? 'Licence' : 'SAA'} {q.number}
                              </span>{' '}
                              <QualBadge q={q} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-700">
                      {s.consent_at ? new Date(s.consent_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** Expiry is the thing that silently invalidates a roster — surface it loudly. */
function QualBadge({ q }: { q: Qualification }) {
  const expired = q.expiry_date ? new Date(q.expiry_date) < new Date() : false;
  const soon =
    !expired && q.expiry_date
      ? new Date(q.expiry_date).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 60
      : false;

  if (expired) return <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">EXPIRED</span>;
  if (soon) return <span className="rounded bg-solar-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-solar-700">expires {q.expiry_date}</span>;
  if (q.verification_status === 'verified')
    return <span className="rounded bg-verify-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-verify-700">verified</span>;
  return <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-700">{q.verification_status}</span>;
}
