/**
 * Database row types — the TypeScript mirror of the first migration set
 * (supabase/migrations/0001_core_schema.sql). Kept hand-authored for now;
 * once the Supabase project exists these can be regenerated with
 * `supabase gen types typescript` and this file becomes the curated surface.
 *
 * Naming follows the SPV MIS-mapping requirement (spec: SPV-readiness): field
 * names are structured so mapping to the SPV Message Interface Standard is a
 * translation, not a redesign.
 */

import type { VerificationOutcome } from './verification';

export type UUID = string;
export type ISOTimestamp = string;

/** Company subscription state (Stripe-backed; billing is web-dashboard only). */
export type SubscriptionState = 'trialing' | 'active' | 'past_due' | 'canceled';

/** company_installer_links.status — THE SEAT lifecycle. */
export type SeatStatus = 'invited' | 'active' | 'deactivated';

/** Per-job crew role. Role is per-job, not per-seat. */
export type CrewRole = 'lead' | 'installer';

/** Qualification verification against issuing registers. */
export type QualificationVerification = 'unverified' | 'verified' | 'expired' | 'lapsed';

export type QualificationType = 'electrical_licence' | 'saa_accreditation';

/** Job lifecycle state machine (spec: Job lifecycle). */
export type JobState =
  | 'created'
  | 'populating'
  | 'scheduled'
  | 'install_ready'
  | 'in_progress'
  | 'signed_off'
  | 'locked';

/** DNSP connection status per job. */
export type DnspStatus = 'not_applied' | 'applied_pending' | 'approved';

/** Regulatory lodgement categories tracked per job. */
export type LodgementType = 'dnsp' | 'stc' | 'ccew' | 'derr';
export type LodgementStatus = 'not_started' | 'submitted' | 'confirmed';

export interface Company {
  id: UUID;
  name: string;
  subscription_state: SubscriptionState;
  stripe_customer_id: string | null;
  created_at: ISOTimestamp;
}

export interface Installer {
  id: UUID;
  /** Supabase auth user id — one login per human. */
  auth_user_id: UUID;
  full_name: string;
  email: string;
  phone: string | null;
  /** Bound device identifiers (append-only). */
  device_bindings: string[];
  created_at: ISOTimestamp;
}

export interface Qualification {
  id: UUID;
  installer_id: UUID;
  type: QualificationType;
  /** e.g. electrical licence class, or SAA scope (grid-connect PV, battery endorsement). */
  scope: string;
  number: string;
  state: string | null;
  expiry: string | null; // date
  verification_status: QualificationVerification;
  verified_at: ISOTimestamp | null;
  created_at: ISOTimestamp;
}

/** THE SEAT — an active company↔installer link. */
export interface CompanyInstallerLink {
  id: UUID;
  company_id: UUID;
  installer_id: UUID;
  status: SeatStatus;
  /** Consent executed at acceptance: data ownership, telemetry, surveillance notice. */
  consent_recorded_at: ISOTimestamp | null;
  consent_version: string | null;
  /** Billing anchor: billing starts at acceptance, stops at deactivation. */
  billing_started_at: ISOTimestamp | null;
  billing_stopped_at: ISOTimestamp | null;
  invited_at: ISOTimestamp;
  created_at: ISOTimestamp;
}

export interface Job {
  id: UUID;
  company_id: UUID;
  state: JobState;
  site_address: string;
  site_lat: number | null;
  site_lng: number | null;
  nmi: string | null;
  system_type: string; // e.g. 'grid_pv', 'grid_pv_battery'
  design_summary: Record<string, unknown> | null;
  // DNSP fields
  dnsp_name: string | null;
  dnsp_reference: string | null;
  dnsp_export_limit_kw: number | null;
  dnsp_status: DnspStatus;
  created_at: ISOTimestamp;
  locked_at: ISOTimestamp | null;
}

export interface JobEquipment {
  id: UUID;
  job_id: UUID;
  category: string; // racking | panel | inverter | isolator | battery
  brand: string;
  model: string;
  /** Reference to the loaded rule set (span tables, clamp zones) for AI verification. */
  rule_set_ref: string | null;
  created_at: ISOTimestamp;
}

export interface JobAssignment {
  id: UUID;
  job_id: UUID;
  seat_id: UUID; // company_installer_links.id
  role: CrewRole;
  assigned_at: ISOTimestamp;
  unassigned_at: ISOTimestamp | null;
}

export interface StageInstance {
  id: UUID;
  job_id: UUID;
  stage_index: number; // 0–10
  /** Confirmed by the Lead — records Lead identity. */
  lead_confirmed_by_seat: UUID | null;
  lead_confirmed_at: ISOTimestamp | null;
  created_at: ISOTimestamp;
}

export interface Capture {
  id: UUID;
  job_id: UUID;
  stage_index: number;
  photo_key: string; // matches RequiredPhoto.key
  storage_ref: string;
  hash: string;
  gps_lat: number | null;
  gps_lng: number | null;
  captured_at: ISOTimestamp;
  device_id: string | null;
  seat_id: UUID; // capturing seat — individual accountability never blurs
  verification_outcome: VerificationOutcome;
  clause_refs: string[];
  /** Append-only: a re-capture supersedes but never replaces. */
  supersedes_capture_id: UUID | null;
  created_at: ISOTimestamp;
}

/** Immutable, admin-visible FAIL log. Never deleted or edited, only superseded. */
export interface NoncomplianceLogEntry {
  id: UUID;
  job_id: UUID;
  capture_id: UUID;
  ai_response: string;
  clause_refs: string[];
  rectification_note: string | null;
  /** Closure requires accredited (Lead) sign-off. */
  closed_by_seat: UUID | null;
  closed_at: ISOTimestamp | null;
  created_at: ISOTimestamp;
}

export interface PanelRegisterEntry {
  id: UUID;
  job_id: UUID;
  serial: string;
  brand: string | null;
  model: string | null;
  capture_id: UUID | null;
  /** Platform-wide duplicate-serial detection result. */
  duplicate_flag: boolean;
  created_at: ISOTimestamp;
}

export interface Lodgement {
  id: UUID;
  job_id: UUID;
  type: LodgementType;
  status: LodgementStatus;
  reference: string | null;
  responsible_party: string | null;
  evidence_ref: string | null;
  recorded_at: ISOTimestamp | null;
  created_at: ISOTimestamp;
}

export interface WeatherRecord {
  id: UUID;
  job_id: UUID;
  observed_at: ISOTimestamp;
  temperature_c: number | null;
  wind_speed_kmh: number | null;
  wind_gust_kmh: number | null;
  precipitation_mm: number | null;
  created_at: ISOTimestamp;
}

/** Drone imagery — the sole controlled capture exception. Never gate evidence. */
export interface SupplementaryMedia {
  id: UUID;
  job_id: UUID;
  storage_ref: string;
  hash: string;
  exif_timestamp: ISOTimestamp | null;
  exif_gps_lat: number | null;
  exif_gps_lng: number | null;
  exif_check_passed: boolean;
  uploaded_by_seat: UUID; // Lead-only
  created_at: ISOTimestamp;
}
