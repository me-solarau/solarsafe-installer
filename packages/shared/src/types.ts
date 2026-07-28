/**
 * Database row types for the Safe Installer app project (hhusohhwqjdpgcgrlzbo).
 *
 * These mirror the LIVE schema, which was created outside this repo — see
 * supabase/README.md. Verified against information_schema, not guessed. If you
 * change the database, change these too (or regenerate with
 * `supabase gen types typescript` and curate).
 */

export type UUID = string;
export type ISOTimestamp = string;
/** date (no time) columns come back as 'YYYY-MM-DD'. */
export type ISODate = string;

/* ------------------------------------------------------------------ company */

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled';

export interface Company {
  id: UUID;
  name: string;
  abn: string | null;
  /** The admin. Company↔auth is a single owner, not a members table. */
  owner_user_id: UUID;
  subscription_status: SubscriptionStatus | string;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

/* ---------------------------------------------------------------- installer */

export interface Installer {
  id: UUID;
  /** Null until the person signs up and claims the row by matching email. */
  auth_user_id: UUID | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  /** Bound device identifiers. */
  bound_devices: unknown[];
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

export type QualificationType = 'electrical_licence' | 'saa_accreditation' | string;
export type VerificationStatus = 'unverified' | 'verified' | 'expired' | 'lapsed' | string;

export interface Qualification {
  id: UUID;
  installer_id: UUID;
  type: QualificationType;
  /** e.g. ['grid_connect_pv'], ['grid_connect_pv','battery'] */
  scope: string[];
  number: string;
  state: string | null;
  expiry_date: ISODate | null;
  verification_status: VerificationStatus;
  verification_date: ISODate | null;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

/* --------------------------------------------------------------------- seat */

/** THE SEAT — an active company↔installer link. */
export type SeatStatus = 'invited' | 'active' | 'deactivated';

export interface CompanyInstallerLink {
  id: UUID;
  company_id: UUID;
  installer_id: UUID;
  status: SeatStatus;
  /** Consent executed at acceptance: data ownership, telemetry, surveillance notice. */
  consent_record: ConsentRecord | null;
  consent_at: ISOTimestamp | null;
  /** Billing starts at acceptance, stops at deactivation. */
  billing_anchor_at: ISOTimestamp | null;
  deactivated_at: ISOTimestamp | null;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
}

export interface ConsentRecord {
  version: string;
  company_data_ownership: boolean;
  telemetry_capture: boolean;
  surveillance_notice: boolean;
  accepted_at: ISOTimestamp;
}

/* --------------------------------------------------------------- RPC shapes */

export interface InviteInstallerResult {
  installer_id: UUID;
  link_id: UUID;
  status: SeatStatus;
  /** True when the person already had an identity (invited, not created). */
  installer_existed: boolean;
  already_linked: boolean;
}

export interface AcceptSeatResult {
  link_id: UUID;
  status: SeatStatus;
  already_active: boolean;
}
