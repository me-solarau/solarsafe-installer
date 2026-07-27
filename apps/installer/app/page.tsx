import { STAGES } from '@solarsafe/shared';

/**
 * Installer app home (Phase 0 placeholder).
 *
 * The real app shows only assigned jobs (lifecycle states 3–6) and runs the
 * stage-gate capture flow — camera-only capture, hashing, geofence, offline
 * queue with Lead-authority sync. Built in Phase 3. This shell renders the
 * stage checklist from the shared package so the workflow is visible.
 */
export default function InstallerHome() {
  return (
    <div className="shell">
      <header className="brand">
        <span className="brand-mark">S</span>
        <span>
          Solarsafe <span style={{ color: 'var(--solar)' }}>Installer</span>
        </span>
      </header>

      <span className="badge">Phase 0 · capture flow lands in Phase 3</span>

      <div className="card">
        <p style={{ margin: 0, fontWeight: 700 }}>14 Ridgeline Dr</p>
        <p className="muted" style={{ margin: '4px 0 0' }}>
          6.6kW · tile · single-phase · Lead: you
        </p>
        <div style={{ marginTop: 16 }}>
          {STAGES.map((stage, i) => (
            <div className="stage-row" key={stage.key}>
              <span style={{ fontSize: 14 }}>
                Stage {stage.index} · {stage.title}
              </span>
              <span className={`pill ${i < 2 ? 'pill-pass' : 'pill-pending'}`}>
                {i < 2 ? 'PASS' : 'PENDING'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="muted">
        In-app camera capture only — no gallery imports. GPS, timestamp, device and seat ID are
        embedded and hashed on every photo. Capture works fully offline; photos sync when
        connectivity allows, with the Lead&apos;s stage confirmations authoritative.
      </p>
    </div>
  );
}
