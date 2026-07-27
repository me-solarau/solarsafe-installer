/**
 * Verification outcomes per photo (spec: "How the gate system works").
 *
 * A stage is gated: the crew cannot advance until every required photo has a
 * PASS or CONDITIONAL_PASS AND the Lead has confirmed the stage.
 */
export const VERIFICATION_OUTCOMES = [
  'pending', // Phase 3: every photo auto-passes to a pending-review state (no AI yet)
  'pass',
  'conditional_pass',
  'fail',
  'unverifiable',
] as const;

export type VerificationOutcome = (typeof VERIFICATION_OUTCOMES)[number];

/** Outcomes that grant gate credit toward stage completion. */
export const GATE_CREDIT_OUTCOMES: readonly VerificationOutcome[] = [
  'pass',
  'conditional_pass',
];

export function grantsGateCredit(outcome: VerificationOutcome): boolean {
  return GATE_CREDIT_OUTCOMES.includes(outcome);
}

export function isBlocking(outcome: VerificationOutcome): boolean {
  return outcome === 'fail' || outcome === 'unverifiable';
}

/** Human-readable meaning for dashboard/app display. */
export const OUTCOME_LABELS: Record<VerificationOutcome, string> = {
  pending: 'Pending review',
  pass: 'Pass',
  conditional_pass: 'Conditional pass',
  fail: 'Fail',
  unverifiable: 'Unverifiable',
};
