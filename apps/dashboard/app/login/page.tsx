'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase-browser';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');

    try {
      const supabase = getSupabase();
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // With email confirmations on, there is no session yet.
        const { data: sess } = await supabase.auth.getSession();
        if (!sess.session) {
          setNotice('Check your email to confirm your account, then sign in.');
          setMode('signin');
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError((err as Error).message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="container-page py-20">
        <div className="card max-w-lg">
          <h1 className="text-xl font-bold text-ink-900">Sign-in isn&apos;t configured yet</h1>
          <p className="mt-2 text-sm text-ink-700">
            This deployment is missing <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. See{' '}
            <code>apps/dashboard/.env.example</code> for the exact values.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">
          {mode === 'signin' ? 'Sign in' : 'Create your company account'}
        </h1>
        <p className="mt-2 text-sm text-ink-700">
          {mode === 'signin'
            ? 'Employer dashboard for Solarsafe Installer.'
            : 'You’ll name your company on the next screen.'}
        </p>

        <form onSubmit={onSubmit} className="card mt-6 grid gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-ink-900">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-lg border border-ink-100 px-3 py-2.5 text-sm focus:border-solar-500 focus:outline-none focus:ring-2 focus:ring-solar-500/30"
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-ink-900">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="rounded-lg border border-ink-100 px-3 py-2.5 text-sm focus:border-solar-500 focus:outline-none focus:ring-2 focus:ring-solar-500/30"
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="text-sm text-verify-700" role="status">
              {notice}
            </p>
          )}

          <p className="text-center text-sm text-ink-700">
            {mode === 'signin' ? (
              <>
                No account?{' '}
                <button
                  type="button"
                  className="font-semibold text-solar-700 hover:text-solar-600"
                  onClick={() => { setMode('signup'); setError(''); }}
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="font-semibold text-solar-700 hover:text-solar-600"
                  onClick={() => { setMode('signin'); setError(''); }}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-ink-700 hover:text-ink-900">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
