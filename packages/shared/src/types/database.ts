/**
 * Hand-written types mirroring the Postgres schema in supabase/migrations.
 * Once a real Supabase project exists, replace/augment with
 * `supabase gen types typescript` output — keep these enums in sync with the
 * migration source of truth in the meantime.
 */

export type QualificationType = 'electrical_licence' | 'saa_accreditation';

export type QualificationVerificationStatus =
  | 'unverified'
  | 'verified'
  | 'expired'
  | 'lapsed';

export type SeatStatus = 'invited' | 'active' | 'deactivated';

export type JobLifecycleState =
  | 'created'
  | 'populating'
  | 'scheduled'
  | 'install_ready'
  | 'in_progress'
  | 'signed_off'
  | 'locked';

export type JobRole = 'lead' | 'installer';

export type StageInstanceStatus = 'locked' | 'unlocked' | 'complete';

export type VerificationOutcome =
  | 'pending_review'
  | 'pass'
  | 'conditional_pass'
  | 'fail'
  | 'unverifiable';

export type LodgementType = 'dnsp' | 'stc' | 'ccew' | 'derr';

export interface Company {
  id: string;
  name: string;
  subscription_state: string;
  created_at: string;
}

export interface Installer {
  id: string;
  auth_user_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface Qualification {
  id: string;
  installer_id: string;
  type: QualificationType;
  scope: string;
  number: string;
  expiry_date: string | null;
  verification_status: QualificationVerificationStatus;
  verified_at: string | null;
  created_at: string;
}

export interface CompanyInstallerLink {
  id: string;
  company_id: string;
  installer_id: string;
  status: SeatStatus;
  consent_recorded_at: string | null;
  consent_version: string | null;
  billing_anchor_at: string | null;
  created_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  lifecycle_state: JobLifecycleState;
  site_address: string;
  site_gps_lat: number | null;
  site_gps_lng: number | null;
  nmi: string | null;
  dnsp_reference: string | null;
  dnsp_export_limit_w: number | null;
  dnsp_status: string;
  design_summary: Record<string, unknown>;
  rules_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface Stage {
  id: number;
  key: string;
  name: string;
  sequence: number;
}

export interface StageInstance {
  id: string;
  job_id: string;
  stage_id: number;
  status: StageInstanceStatus;
  lead_confirmed_by: string | null;
  lead_confirmed_at: string | null;
}

export interface Capture {
  id: string;
  job_id: string;
  stage_instance_id: string;
  company_installer_link_id: string;
  device_id: string | null;
  storage_ref: string;
  sha256_hash: string;
  gps_lat: number | null;
  gps_lng: number | null;
  captured_at: string;
  verification_outcome: VerificationOutcome;
  ai_response: Record<string, unknown> | null;
  clause_refs: string[];
  supersedes_capture_id: string | null;
  created_at: string;
}

export interface NoncomplianceLogEntry {
  id: string;
  capture_id: string;
  ai_response: Record<string, unknown>;
  rectification_note: string;
  rectification_capture_id: string | null;
  closed_by_installer_id: string | null;
  closed_at: string | null;
  created_at: string;
}

export const STAGE_SEQUENCE: ReadonlyArray<{ id: number; key: string; name: string }> = [
  { id: 0, key: 'pre_start', name: 'Job setup & pre-start' },
  { id: 1, key: 'roof_fixings', name: 'Roof fixings & penetrations' },
  { id: 2, key: 'racking_rails', name: 'Racking & rails' },
  { id: 3, key: 'dc_wiring', name: 'DC wiring (pre-panel)' },
  { id: 4, key: 'panel_install', name: 'Panel installation & serial capture' },
  { id: 5, key: 'earthing_bonding', name: 'Earthing & bonding completion' },
  { id: 6, key: 'inverter_isolation', name: 'Inverter & isolation devices' },
  { id: 7, key: 'switchboard_ac', name: 'Switchboard & AC connection' },
  { id: 8, key: 'signage_labelling', name: 'Signage & labelling' },
  { id: 9, key: 'testing_commissioning', name: 'Testing & commissioning' },
  { id: 10, key: 'handover_closeout', name: 'Handover, admin close-out & sign-off' },
];
