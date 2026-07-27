export function Logo({ className = '', tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  const text = tone === 'light' ? 'text-white' : 'text-ink-900';
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${text} ${className}`}>
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="28" height="28" rx="8" fill="#0d1526" />
        <path d="M16 7l7 4v6c0 4.2-2.9 7.4-7 8.6C11.9 24.4 9 21.2 9 17v-6l7-4z" fill="#f5a524" />
        <path d="M13.4 16.2l1.8 1.9 3.6-3.9" stroke="#0d1526" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[1.05rem]">
        Solarsafe<span className="text-solar-500"> Installer</span>
      </span>
    </span>
  );
}
