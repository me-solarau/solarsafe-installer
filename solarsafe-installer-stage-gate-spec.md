# Solarsafe Installer — Product Specification
**Scope:** Stage-gate photo verification for grid-connected rooftop PV (residential, single/three-phase; battery addendum v1.1), plus platform architecture: accounts & seats, job lifecycle, evidence pack, STC export, NSW regulatory lodgement, telemetry & analytics
**Version:** 0.19 — Adds automatic install-day weather record + drone imagery as the sole controlled capture exception
**Status:** Clause references are indicative and MUST be verified against current standard editions before being encoded into the AI verification engine (see "Standards verification note" at end).

---

## How the gate system works

Each job moves through sequential stages. A stage is **gated**: the crew cannot advance until every required photo in the stage has been captured in-app and has received a PASS or CONDITIONAL PASS from AI verification, and the stage has been confirmed by the Lead Installer (on single-installer jobs, the sole installer is the Lead and must be Lead-eligible — see Crew roles).

**Verification outcomes (per photo):**

| Outcome | Meaning | Effect |
|---|---|---|
| PASS | Meets the checked criteria | Gate credit |
| CONDITIONAL PASS | Acceptable but flagged (e.g. partially obscured view) | Gate credit + employer dashboard flag |
| FAIL | Visible non-conformance detected | Blocked. Plain-English rectification note issued. Re-photo required after fix |
| UNVERIFIABLE | Photo quality/angle insufficient to assess | Blocked. Re-capture guidance shown (angle, distance, lighting) |

**Evidence integrity (applies to every photo):**
- In-app camera capture only — no gallery imports. **Single exception: drone imagery**, via a dedicated supplementary media slot — Lead-only upload, EXIF timestamp/GPS preserved and cross-checked against the job window and site geofence, hashed on ingest, labelled "supplementary — drone" in the pack. Drone images never satisfy a gate; they enhance the record (aerial verification of the completed array against the imported design layout, perimeter/aesthetics view, roof-condition context) and give the retailer a customer-facing showcase image
- GPS coordinates, timestamp, device ID, and installer seat ID embedded and hashed
- Geofence check against job site address
- Photos sync when connectivity allows; capture works fully offline

**Weather record (automatic, zero installer effort):**
- The app writes install-day weather into the evidence pack from a weather data provider, keyed on site GPS and stage timestamps: temperature, wind speed/gusts, precipitation, hour-by-hour across the install window
- Three uses: ambient temperature feeds Stage 9's temperature-adjusted Voc band (the check needs a temperature source); wind/rain records support WHS posture and dispute defence; weather context normalises stage-duration telemetry so conditions-slowed crews aren't flagged unfairly

---

## Stage 0 — Job setup & pre-start

**Purpose:** Establish site context and safety baseline before work begins.

**Required photos:**
1. Whole roof from ground level (array location visible)
2. **Pre-existing roof condition survey** — systematic photos of the work area and access path BEFORE anyone steps on the roof: existing broken/cracked/slipped tiles, dents or scratches in metal sheeting, rust patches, degraded pointing/ridge capping, existing penetrations, gutter damage. Wide shots per plane plus close-ups of every visible defect
3. Existing switchboard, cover open — full board visible
4. Meter box / metering arrangement
5. Roof access & fall protection in place (anchor points, rails, scaffold, or harness setup)

**AI verifies:** Roof type identification (tile/tin/klip-lok — feeds clamp-zone logic later); switchboard has visible spare capacity or flags likely board upgrade; fall protection visibly present. For the condition survey, AI detects and tags visible defects (cracked tiles, dents, rust) and logs them to a pre-existing defect register on the job record — each tagged defect is timestamped, GPS-locked evidence that it predates the install.

**Gate rule:** Hard gate — no Stage 1 fixing photos accepted until the condition survey is complete. This is deliberately the first thing the installer must do on arrival; the evidence is worthless if captured after work starts.

**Primary references:** NSW WHS Regulation (working at heights); AS/NZS 3000 for switchboard condition context.

**Why it matters to the employer:** SWMS evidence + a defensible record of pre-existing roof and switchboard condition. "Your installer broke my tiles / dented my roof" is among the most common post-install disputes, and it is nearly indefensible without before-photos. The defect register turns it into a timestamped lookup. Secondary benefit: pre-existing defects flagged before work can be raised with the customer up front (e.g. "three cracked tiles noted at the array location prior to commencement"), which is both a dispute-killer and a professionalism signal — and protects the installer too if a pre-existing defect would compromise the install (e.g. brittle tiles, corroded sheeting).

---

## Stage 1 — Roof fixings & penetrations

**Purpose:** The most litigated defect class — leaks. Once panels go on, this is invisible forever.

**Required photos:**
1. Bracket/foot fixed into rafter/batten — close-up showing fixing point, minimum one per row plus any atypical fixing
2. Every roof penetration sealed/flashed (tile: lead/flexible flashing dressed; tin: appropriate sealing per manufacturer)
3. Tile handling — ground/cut tiles reseated correctly (tile roofs only)
4. Wide shot of completed fixing layout before rails go on

**AI verifies:** Fixing lands in structural member not just sheeting; flashing dressed over (not under) tile profile; no visible cracked tiles left in place; foot spacing plausible against layout.

**Primary references:** Racking manufacturer installation manual and engineering certificate (AS/NZS 1170 wind loading basis); AS/NZS 5033 mechanical installation requirements.

**Gate rule:** Hard gate. No rail photos accepted until Stage 1 complete.

---

## Stage 2 — Racking & rails

**Purpose:** Structural integrity and array frame bonding.

**Equipment-list driven:** The racking brand/model on the job record is the AI's rule source for this stage — it loads that manufacturer's span tables, fixing spacing, overhang limits, and splice requirements for the identified roof type and wind zone. No generic rules; the manufacturer instruction is the standard being verified against.

**Required photos:**
1. Rail spans and overhangs — wide shot per roof plane with fixings visible
2. Fixing/foot spacing along rail — shot angle showing consecutive fixing points so spacing is measurable against the manufacturer's requirements
3. Rail splice/joiner close-up (each splice)
4. Earth/bonding lug attached to rail — close-up per rail run, showing corrosion protection (correct lug type for dissimilar metals, stainless/serrated hardware, anti-corrosion treatment per manufacturer)

**AI verifies:** Fixing spacing, spans, and overhangs against the specific racking manufacturer's tables for the roof type/zone on the job record; splices fully engaged; bonding lugs present with conductor attached and appropriate corrosion protection visible (bimetallic contact between lug, rail, and conductor addressed — a common long-term failure point in coastal environments).

**Primary references:** Racking manufacturer installation manual and engineering certificate (AS/NZS 1170 wind loading basis); AS/NZS 5033 array frame earthing/bonding; AS/NZS 3000 Section 5 (earthing arrangements).

---

## Stage 3 — DC wiring (pre-panel)

**Purpose:** Cable runs get covered by the array — capture before they disappear.

**Required photos:**
1. DC cable runs on roof — supported, protected, no contact with sharp edges, UV-rated conduit/enclosure where required
2. Roof entry point (dektite/gland) sealed
3. Cable route through ceiling space where accessible — support spacing and mechanical protection visible
4. Cable labelling at key points

**AI verifies:** Cables supported (no lying loose on roof surface), conduit saddled at plausible intervals, roof entry sealed, correct cable type visually identifiable (PV1-F solar cable), segregation from other services where visible.

**Primary references:** AS/NZS 5033:2021 wiring system requirements (note the 2021 edition materially changed rooftop DC requirements — verify current amendment status); AS/NZS 3000 Section 3 (wiring systems, mechanical protection).

---

## Stage 4 — Panel installation & serial capture

**Purpose:** Correct mechanical mounting plus **STC evidence capture** — this stage doubles as the employer's rebate audit file.

**Required photos:**
1. Serial number / barcode of every panel (in-app barcode scan preferred, photo fallback)
2. Clamp positions — close-ups showing clamps within manufacturer clamp zones (mid and end clamps, representative per row)
3. Completed array per roof plane — alignment, no overhang beyond rail design
4. Panel-to-panel bonding where earthing method requires it

**AI verifies:** Serial legible and unique within job (duplicate detection across ALL jobs in the platform — a powerful fraud signal); clamps inside marked clamp zones; array geometry matches job design — panel count per string, and where a design import exists (Pylon), panel count and orientation per roof plane against the imported layout.

**Primary references:** Panel manufacturer installation manual; CER STC evidence requirements (serials, on-site photos); AS/NZS 5033.

**Employer value spike:** This single stage generates the photographic evidence set the CER expects for STC claims. Duplicate-serial detection across the platform is protection against the exact conduct the CER audits for. Stage 4 capture rules are defined to be SPV-compatible from day one — see "STC Evidence & Export Layer" below.

---

## Stage 5 — Earthing & bonding completion

**Required photos:**
1. Main earthing connection for the array system — lug, conductor size readable
2. Continuity path connections (rail-to-rail links, plane-to-plane)
3. Earth conductor route and termination at switchboard end

**AI verifies:** Lug crimped (not screw-through-strand), conductor size plausibly ≥ minimum, green/yellow identification, connection mechanically sound in frame.

**Primary references:** AS/NZS 5033 earthing requirements; AS/NZS 3000 Section 5.

---

## Stage 6 — Inverter & isolation devices

**Purpose:** Termination photos BEFORE lids/covers close — another invisible-forever class.

**Required photos:**
1. Inverter mounted — location shot showing clearances, protection from direct sun/weather per manufacturer
2. DC terminations at inverter/isolator — lid open, torque/seating visible
3. AC isolator adjacent to inverter — terminations before cover on
4. Rooftop isolation arrangement as applicable under current AS/NZS 5033 edition (requirements changed in 2021 — engine must apply the edition in force at install date)
5. Conduit/cable entries into inverter glanded and sealed

**AI verifies:** Manufacturer clearance zones respected; no exposed copper at terminations; correct polarity labelling visible; enclosure IP integrity (glands, no open knockouts).

**Primary references:** AS/NZS 5033 (isolation & switching); AS/NZS 4777.1 (inverter installation requirements); inverter manufacturer manual.

---

## Stage 7 — Switchboard & AC connection

**Required photos:**
1. Solar supply main switch installed and labelled
2. Circuit protection device — rating legible
3. Terminations at board (before cover refit)
4. Completed board with escutcheon/cover on, updated circuit schedule visible

**AI verifies:** Breaker rating legible and consistent with job design; dedicated solar main switch present and labelled; board schedule updated; no double-lugging visible.

**Primary references:** AS/NZS 3000; AS/NZS 4777.1; NSW Service and Installation Rules.

---

## Stage 8 — Signage & labelling

**Purpose:** The most common minor-defect class in audits — and the easiest AI win, because labels are highly machine-verifiable.

**Required photos:**
1. Main switchboard signage set (PV system on premises, solar main switch label, dual supply where applicable)
2. Inverter labels (shutdown procedure adjacent)
3. DC isolator/cable labelling
4. Battery-ready or metering labels where applicable

**AI verifies:** Each mandatory label present, correct wording class, legible, durable type (not handwritten), in the correct location. Checklist-complete logic: engine holds the full label schedule for the system type and ticks each off.

**Primary references:** AS/NZS 5033 signage requirements; AS/NZS 4777.1; AS/NZS 3000.

---

## Stage 9 — Testing & commissioning

**Purpose:** Convert the test process itself into evidence.

**Required photos:**
1. Instrument display: array open-circuit voltage (Voc) per string, alongside string label
2. Instrument display: insulation resistance result
3. Instrument display: earth continuity result
4. Inverter display/app: correct region setting (AS/NZS 4777.2 Australia A/B/C as applicable), export limit configured per DNSP approval
5. Polarity verification at final connection

**AI verifies:** Reading on screen within expected range for the job design (e.g. Voc consistent with panel count × Voc spec, temperature-adjusted using the pack's automatic weather record for the capture timestamp); inverter region setting string matches required value; export limit value matches DNSP connection approval on the job record.

**Primary references:** AS/NZS 5033 verification/testing; AS/NZS 4777.1 & 4777.2 (grid settings); DNSP connection agreement (Ausgrid/Endeavour/Essential in NSW).

**Note:** Reading instrument displays from photos is genuinely achievable with current vision models and is a headline differentiator — the test results become tamper-evident.

---

## Stage 10 — Handover, admin close-out & sign-off

**Core principle: ALL admin is done at job sign-off.** Sign-off is not a photo milestone — it is the moment every administrative obligation within the company's control has been executed. The crew leaves site with nothing left on the desk.

**Required photos:**
1. Final completed array (each plane) + inverter operating (display showing generation)
2. Site tidy shot
3. **Post-work roof condition** — same planes and access path as the Stage 0 survey, enabling direct before/after comparison; AI cross-checks against the pre-existing defect register and flags any new damage for rectification before the crew leaves site
4. Customer handover pack photographed or digitally attached (manuals, warranty docs, shutdown procedure)

**Admin close-out gate (all required before sign-off is accepted):**

| Item | Completed by | Done means |
|---|---|---|
| CCEW lodged | Lead Installer (licence-verified certifier) | Lodged via eCert/CER Installer Portal, certificate uploaded or number entered in-app |
| DERR submitted | Lead Installer | DER Register entry made, confirmation reference recorded |
| STC evidence pack exported | System (automatic) | Canonical pack generated and delivered to the company's nominated STC agent via their adapter |
| DNSP post-install notification | Lead Installer (or company office, per company workflow) | Notification sent per DNSP process, reference recorded |
| Compliance pack generated | System (automatic) | Clause-referenced pack finalised: photos, GPS, timestamps, verification results, serial register, test evidence |
| Customer handover | Lead Installer | Handover pack delivered, customer copy of verification summary issued |

**"Done" is defined honestly:** everything within the company's control is *executed* at sign-off. Third-party confirmations that arrive later (agent's STC registry creation, DNSP acknowledgment) are tracked on the dashboard afterwards but do not hold up sign-off — the obligation was discharged on site.

**System actions on sign-off:**
- Employer notified: job verified complete, X passes / Y conditionals / rectification history, all admin discharged
- Job locked (read-only evidence record)
- Any close-out item that genuinely cannot complete on site (e.g. eCert outage) converts to a red flag on the employer dashboard with automated reminders — the exception, never the workflow

---

## Battery addendum (AS/NZS 5139) — separate stage pack, v1.1

Hybrid/battery jobs append stages covering: location restriction zones (habitable room walls, egress paths, clearances), non-combustible barrier/mounting surface, dedicated signage set, cable and protection arrangements, and commissioning evidence. Structurally identical gate logic; separate checklist tree keyed off system type at job creation.

---

## Job lifecycle

Jobs are created at **point of sale** and mature over the following weeks — data entry is decoupled from installer assignment.

**1. Created (point of sale)** — office opens the job: customer, site address, NMI, system design, proposed equipment list. DNSP connection application typically lodged now. **Preferred creation path: design import** — the company exports the job's design from their design tool (Pylon first; OpenSolar/Aurora as later adapters) and the import pre-populates equipment list, panel count, string configuration, and per-plane layout in one step. v1 accepts exported design files; v2 pulls via design-tool APIs. The imported layout becomes a verification asset: Stage 4 checks the completed array against it (panel count per plane, orientation) — catching sold-vs-installed mismatches on the roof, not at the customer complaint

**2. Populating (office, weeks before install)** — fields land as they become available: DNSP approval reference + export limit, confirmed equipment list (locks the AI rule set for the job), DERR arrangements. The dashboard shows per-job field completeness so the office sees what's still missing across the pipeline.

**3. Scheduled (installer assigned)** — when scheduling is possible, the company assigns one or more seats to the job. The installer receives the job in-app with everything already populated: address, design, equipment, gates and required photos, the export limit Stage 9 will check against. Assignment is the trigger for the installer to see the job — never before.

**4. Install-ready** — all mandatory pre-install fields present (DNSP approval reference is the hard gate). A scheduled job missing fields flags amber on the dashboard as the install date approaches.

**5. In progress** — stage-gate capture, Stage 0 → 10.

**6. Signed off** — admin close-out gate cleared, all obligations executed.

**7. Locked** — read-only evidence record; post-sign-off third-party confirmations tracked against it.

Design consequence: the pipeline view is the office tool (jobs by state, field completeness, approaching installs with gaps), while the installer app only ever shows assigned jobs in states 3–6. Reassignment before Stage 1 is trivial; reassignment mid-capture transfers remaining gates to the new seat with the capture history intact.

---

## Account & seat architecture

**Model:** Free global installer identity + company-owned seats via invitation. Matches the pattern installers already know from GreenDeal/Greenbot/Formbay — zero retraining on the concept.

### Installer account (free, global, owned by the installer)
- One login per human, created by the installer on app download
- Holds: name, contact, bound device(s), and a **vetted qualification set**:
  - **Electrical licence** — state, class, number, expiry
  - **SAA accreditation** — accreditation number, type (install and/or design), and scope: grid-connected PV, with battery endorsement where held. Accreditation requires the underlying electrical licence — the profile enforces that dependency
  - Verification against the issuing registers (NSW licence check, SAA public register) at profile setup and re-checked on expiry dates; expired or lapsed credentials flip the profile to unverified and notify every company holding an active seat for that installer
- Every company that invites this installer sees the verified qualification set instantly (selling point: companies skip their own paperwork check, and can't accidentally roster an unaccredited installer)
- Can hold links to multiple companies simultaneously; installer switches active company context per job

### Seat (billable, owned by the company)
- A seat = an **active company↔installer link**, created when the company sends an invitation and the installer accepts
- Acceptance flow is where consent executes: company data ownership, telemetry capture, NSW workplace surveillance notice — recorded against the link with timestamp
- Billing starts at acceptance, stops at deactivation; a subbie working for two companies = two seats billed (one each), one login
- Deactivated links preserve all history; evidence never leaves the company account

### Evidence & visibility rules
- All job evidence, packs, and telemetry belong to the company whose job it is — firewalled absolutely between companies
- Installer sees their own capture history (read-only, no export) — they can review what they photographed, not repurpose it
- Quality metrics (first-time pass rate) accrue against the installer identity but are visible only to companies for jobs done under their own seats (v1). Cross-company portable quality profile is the v2 unlock, gated on installer consent — the data model supports it from day one because the identity layer exists

### Crew roles on a job (multi-installer sites)
- When multiple seats are assigned to one job, the company designates exactly one **Lead Installer** at assignment; the rest are Installers. The role is per-job, not per-seat — today's lead can be tomorrow's crew member
- **Lead eligibility is enforced and job-type aware:** the Lead picker only offers seats whose vetted qualification set matches the job — electrical licence + SAA PV accreditation for grid-connect PV jobs; battery endorsement additionally required for battery/hybrid jobs. The Lead signs off the CCEW, so the certifying credentials must be real, current, and verified before designation is even possible
- **Any assigned installer can capture** — every photo remains attributed to the seat that took it (individual accountability never blurs)
- **Non-compliance calls are protected:** crew members cannot accept, dispute, dismiss, edit, or annotate a FAIL or its rectification note — capture is their only interaction with the gate system. A FAIL stands untouched until an accredited authority acts on it
- **Rectification closure requires accredited sign-off:** after corrective work, anyone on the crew may capture the re-photo, but the rectification is only closed when the Lead (accredited, licence-verified) confirms it against the AI's re-verification. The closure record carries the Lead's identity — corrective work is never self-certified by the person who did it, and never closed by an unaccredited hand. The full FAIL → rectification note → corrective work → re-photo → accredited closure chain is preserved in the job's non-compliance log (admin-visible only — see STC Evidence & Export Layer); the customer-facing pack presents the final compliant state
- **The Lead has final say:** stage completion is confirmed by the Lead, gate disputes (contested FAIL, re-photo calls) are the Lead's decision, and job sign-off + admin close-out actions are Lead-only. Lead identity is recorded on every stage confirmation and the sign-off
- **The Lead signs off the CCEW:** the Lead is the certifying licensee for the job — they lodge the CCEW (eCert / CER Installer Portal) and upload it in-app as part of the admin close-out. One person is responsible for the work, confirms the stages, and certifies it: workflow authority and legal certification align in the same identity
- **Sync authority:** in offline conflicts, the Lead's stage confirmations are authoritative; parallel captures from other seats merge under them (largely resolves the multi-installer sync question — remaining edge cases are capture-ordering only)
- Lead reassignment mid-job (sick, called away) is a company dashboard action, recorded in the job history — the replacement must also be licence-verified

### Why this model wins
- Installer onboarding for a new company is a push-notification accept, not an account creation — critical for the Sunboost-tier retailer onboarding 200 subbies in a week
- Company admin sees a live roster: invited / active / deactivated, accreditation status, per-installer pass rates
- Solves the two-retailer subbie question with no compromise: revenue doubles, data stays clean, installer carries one app

---

## Telemetry & efficiency analytics (employer dashboard)

Every gated photo carries a timestamp, so **per-stage durations are captured for free** — no timers, no installer effort. Aggregated over jobs and time, this becomes an operations lens no retailer currently has.

### What the timeline shows
- **Per-stage duration per job**, per crew, per installer — e.g. Stage 1 (roof fixings) trending from 50 to 70 minutes for one crew over six weeks
- **Efficiency drift detection:** rolling per-stage averages per team; sustained drift flags on the dashboard (fatigue, crew change, training gap, harder job mix — the flag prompts the question, the manager answers it)
- **Anomaly flags, both directions:** a stage completed dramatically *faster* than the installer's own baseline is the more important signal — it correlates with corner-cutting and predicts FAILs. Speed anomalies cross-referenced against verification outcomes per job
- **Quality × time correlation:** first-time pass rate plotted against stage durations — identifies the crews that are both fast and clean (the benchmark), and whether a team's quality dips when their pace rises
- **Job-mix normalisation:** durations compared within like jobs (system size, roof type, storeys) so a crew doing double-storey tile isn't judged against single-storey tin

### Design principles (restated from performance incentive decision)
- **First-time pass rate is the headline metric.** Duration data is diagnostic and secondary — surfaced as bands and trends, never a raw speed leaderboard. Rewarding raw speed manufactures the corner-cutting the gates exist to prevent
- Telemetry belongs to the company (per seat consent); visible per-company only, consistent with the evidence firewall
- Timeline views: per job (stage waterfall), per crew (trend over weeks/months), per company (fleet overview)

### Why it sells
A retailer running 30 subbie crews currently learns about a struggling team from complaint volume — a lagging indicator measured in weeks and refunds. Stage-duration drift plus pass-rate dip is the same signal, weeks earlier, measured passively. This turns the app from a compliance record into an early-warning operations system.

---

## STC Evidence & Export Layer

**Design principle:** One canonical evidence pack per job; thin export adapters per STC agent on top. Never build agent-specific capture — build agent-specific *output* only. The same pack later becomes the SPV signed-data-package source when App Provider status is pursued (v2).

### Canonical evidence pack (per job)

A single, versioned, machine-readable record assembled progressively as stages complete and finalised at job lock:

**Job identity**
- Job ID, site address, GPS of site, system type, design summary (panel count, string config, inverter model, export limit per DNSP approval)
- **Equipment list** — racking system brand/model, panel brand/model, inverter, isolators, battery where applicable. This is the AI's rule source: each item loads its manufacturer installation requirements (span tables, clamp zones, clearances, torque specs) as the verification standard for the relevant stages
- Company account ID, assigned installer seat ID(s), Lead Installer identity (per-job designation history if reassigned)
- Install date(s), rules-version applied (standards edition-at-date)

**Panel register (Stage 4 output)**
- Per panel: serial (barcode scan preferred), brand, model, capture timestamp, GPS at capture, capturing seat ID, photo asset reference
- Platform-wide duplicate-serial check result
- Inverter serial(s) captured the same way

**Evidence assets**
- Every stage photo with embedded metadata: timestamp, GPS, device ID, seat ID, stage/checkpoint reference, AI verification outcome and clause references
- Test evidence set (Stage 9): instrument-display photos + AI-read values (Voc per string, insulation resistance, earth continuity, inverter region setting, export limit)
- **Install-day weather record** (automatic): hourly temperature, wind, precipitation for the site across the install window — feeds Voc adjustment, WHS context, telemetry normalisation
- **Supplementary media**: drone imagery via the Lead-only controlled exception — EXIF-verified, hashed, labelled; never gate evidence

**Non-compliance log (admin-visible only)**
- Every FAIL is preserved as a log entry in a documents folder on the job record: the non-compliant photo, the AI's verification response and clause references, the rectification note, the replacement photo(s), and the accredited closure record (Lead identity, timestamp)
- Visibility: **company admin/dashboard only** — not included in the customer handover pack, which presents the final compliant state and verification summary. Full rectification history remains available to the company for disputes, CER audits, installer performance review, and training
- The log is immutable and part of the locked job record: entries can never be deleted or edited, only superseded by the compliance chain. Replacing a photo to achieve compliance never erases the original — the non-compliant capture and its AI response stay in the log permanently
- Log entries feed the analytics layer: FAIL categories per installer/crew/stage are the raw material for first-time pass rates and targeted training

**Integrity layer**
- Each asset hashed at capture; job-level hash chain so any later tampering is detectable
- Job locked read-only at completion (mirrors SPV posture: serials cannot be edited after "Installed")
- Verification audit log: every PASS/FAIL/override with actor and justification

### Immutability rules

1. Capture in-app only; no gallery imports, no post-hoc uploads
2. Serial records and photos are append-only during the job; nothing deletable, re-captures supersede but never replace history
3. Job lock at completion freezes the entire pack; corrections after lock require a formal amendment record (new entry, original preserved)
4. Company owns the pack and all telemetry (per seat activation terms); installer identity travels with each asset for auditability

### Export adapter pattern

- **Adapter = output format + delivery method** for one STC agent (GreenDeal, Greenbot, Bridge, Formbay-based agents, etc.)
- v1 adapters can be low-tech: generate the exact file/photo/CSV bundle the agent's lodgement portal expects, downloadable or emailed from the employer dashboard. No API required to deliver the "one app, photograph once" experience
- When an agent exposes an API, the adapter swaps delivery method; the pack is untouched
- Adapter registry lives in the employer dashboard: company selects their agent(s); multi-agent companies supported (different agents per job)

### SPV-readiness requirements (build now, certify later)

To keep the App Provider path open without committing to it:

1. Serials scanned **on site, at install time, with GPS enabled** — matching current SPV app posture
2. No editing of serial records after job completion
3. Panel brand/model captured against the CEC approved-modules framing
4. Pack schema fields named/structured so mapping to the SPV Message Interface Standard (MIS) is a translation, not a redesign

### App Provider path (v2 summary — parked, not abandoned)

Becoming an SPV App Provider requires: a signed SPV Deed with the CER; a solicitor-drafted legal arrangement with at least one existing Verification Service Provider (VSP); implementation of the SPV MIS; CER background checks (Fit and Proper Person elements); and ongoing deed compliance/performance-monitoring obligations, operating nationally. Prerequisite posture: live product, revenue, clean evidence trail. GreenDeal or another agent's VSP relationship may be the entry vehicle.

### Immediate low-cost actions

- Email the CER SPV team (solarpanelvalidation@cer.gov.au) to request the MIS documentation and App Provider guidance — architect toward it for free
- Ask GreenDeal (and Greenbot, Bridge) one question: "What format do you want install evidence packs in?" Every yes is a distribution channel into their retailer base
- Extend the solicitor brief: seat activation consent (company data ownership + telemetry), and future SPV Deed/VSP arrangement awareness

---

## Regulatory lodgement surface (NSW v1)

Beyond STCs, every NSW job carries three further lodgement obligations. The canonical evidence pack already holds most of the required fields — the app's job is to track each obligation per job, pre-fill the data, and record the reference numbers into the compliance pack. Same adapter philosophy as STC agents: canonical pack in the middle, thin per-authority outputs.

### 1. DNSP connection (before AND after install)
- **Primary flow (retailer-supplied):** at job creation, the company enters the DNSP connection **application/approval reference** and approved **export limit** in dedicated fields on the job record — in the Sunboost-tier workflow the office team lodges the connection application at point of sale, so these normally exist before a crew is assigned. Stage 9 verifies inverter settings against the recorded export limit
- **Fallback flow (no reference exists):** the reference field left empty surfaces the guided application path —
  - App detects the DNSP from the site address/NMI and routes to the correct portal (Ausgrid "Alter Existing Connection", Endeavour, Essential)
  - Presents a copy-ready application data summary pre-filled from the job record (address, NMI, system capacity, inverter model, proposed export limit)
  - v1 delivery: deep-link into the DNSP portal with the summary alongside (no public DNSP submission APIs — human completes the portal form); v2: direct submission if/when DNSP APIs open up
  - Connection status tracked per job: **Not applied → Applied (pending) → Approved (reference + export limit recorded)**
- Jobs can be created and scheduled without a reference, but install-ready is gated on an approval reference being recorded — **no on-site capture (Stage 0 onward) begins until the job is install-ready.** Installing ahead of approval risks an export-limit mismatch and a failed Stage 9
- **Post-install:** completion/notification obligations per DNSP process

### 2. CCEW via BCNSW eCert — MANDATORY DIGITAL from 1 July 2026
- All CCEWs must now be lodged through the BCNSW eCert portal (individually or via approved API); handwritten/PDF forms no longer accepted
- BCNSW is building an **eCert API** for integration with electricians' business systems — this is the eCert equivalent of the SPV signed data package and a priority v2 integration target (monitor: nsw.gov.au eCert API for electrical industry page)
- Parallel channel: from mid-2026, registered installers on the **NSW CER Installer Portal** can lodge CCEWs for new/upgraded solar and battery systems there instead of eCert — track which channel each company uses
- **In-app CCEW upload:** after lodging, the Lead Installer (certifying licensee) uploads the lodged CCEW (PDF/receipt) or enters the certificate number in-app; it attaches to the job's compliance pack, timestamped against the certifier's identity. The job's CCEW line shows **Not lodged → Lodged (evidence attached)**. Automated reminders to the Lead until uploaded — missed CCEWs carry per-instance fines, so the reminder alone has cash value
- App role v1: CCEW data summary pre-filled from the pack (copy-paste ready for the portal); lodged certificate captured in-app; lodgement reference + lodging licensee recorded before job lock. App records, never certifies — the licensed electrician remains the certifier
- App role v2: direct lodgement via the eCert API once released

### 3. AEMO DER Register (DERR)
- Installed DER device data (inverter/battery make, model, capacity, settings) must be provided to AEMO's DER Register via the DERR Installer Portal following connection — often woven into the DNSP's own process
- **Primary flow (retailer-supplied):** dedicated entry field for the DERR record/confirmation reference where the company's office manages DERR (or the DNSP process handles it automatically)
- **Fallback flow:** no reference entered surfaces the deep link to the AEMO DERR Installer Portal with a pre-filled data summary — the pack already captures every DERR field at Stage 4/6 (serials, models, capacities, inverter settings)
- Sign-off close-out accepts either: a company-supplied reference, or an installer-completed submission with confirmation reference

### Lodgement tracker (employer dashboard)
Per job, a four-line status board: DNSP approval → STC lodgement → CCEW → DERR, each with reference number, responsible party, and date. Job shows "fully lodged" only when all four are recorded. This tracker alone is a selling point — retailers currently manage this across spreadsheets, four portals, and memory.

### Strategic note
NSW is consolidating solar lodgement channels right now (eCert mandatory-digital as of July 2026, CER Installer Portal CCEW channel from mid-2026, Smart Meter Tool phased out March 2026). Every retailer's paperwork process is being forcibly changed this year regardless — the ideal moment to introduce a tool that captures once and feeds every channel.

---

## Standards verification note (critical, do before AI engine build)

1. **Clause numbers are deliberately omitted above.** Standards Australia text is copyrighted and clause numbering shifts between editions/amendments. The verification engine should be built against a licensed copy of the current editions — AS/NZS 3000, AS/NZS 5033 (2021 + amendments), AS/NZS 4777.1 and 4777.2, AS/NZS 5139 — accessed through the business's own standards subscription.
2. **The engine must reference clauses, never reproduce standards text** in outputs. Rectification notes should be written in original plain English with a clause citation (e.g. "refer AS/NZS 5033:2021 cl X.X.X"), matching the approach already used in Solarsafe rectification letters.
3. **Edition-at-date logic:** the rules applied must be the edition in force on the install date — store a rules-version per job.
4. SAA (Solar Accreditation Australia) install guidelines and CER inspection criteria should be layered on top as a second rule set, since CER-style inspections are what the employer is ultimately being protected against.

---

## Open items for next session

- Photo count / verification-call budget per job (drives the fair-use cap per seat)
- UNVERIFIABLE retry limits and human-review escalation path (employer manual override with recorded justification — decision pending; solve together with DNSP-gate edge-case overrides as one override policy)
- Pylon export format specifics (file structure, fields available) — confirm before building the import parser; check Pylon partner/API program
- Offline sync capture-ordering edge cases (Lead-authority model resolves the main conflict question)
- Where this evidence trail plugs into Solarsearch review scores / strike softening
- NSW workplace surveillance notice/consent wording for seat activation (solicitor brief item)
- Single-installer jobs where the sole installer isn't Lead-eligible (unlicensed) — is a remote Lead permitted, or is an eligible on-site Lead mandatory? Leaning mandatory on-site (CCEW certifier duty implies presence), but confirm against NSW certification obligations

## Decisions locked (this spec version)

- Buyer: solar retailer/employer (Sunboost/Arise tier is the volume target); company owns account, all evidence, and telemetry
- Seat = an active company↔installer link. Installers hold a free global identity with a vetted qualification set (electrical licence + SAA accreditation scope, verified against issuing registers and re-checked at expiry) and join companies by accepting invitations; employer dashboard free/unlimited; a subbie at two companies = two billed seats, one login; evidence firewalled per company
- Fair-use job cap per seat tier (no per-job pricing)
- Subscription sold via web dashboard (Stripe), never in-app — installer app is a free login shell
- STC strategy: canonical evidence pack + per-agent export adapters (v1); SPV App Provider status parked as v2
- Equipment list is the AI's rule source: per-manufacturer installation requirements (spans, spacing, clamp zones, clearances) loaded per job, layered under the AS/NZS rules; parameters extracted with manual-version citation, never manual text stored
- **All admin done at job sign-off**: CCEW lodged + uploaded, DERR submitted, STC pack exported to agent, DNSP notified, compliance pack generated, customer handover issued — all executed before sign-off is accepted; later third-party confirmations tracked but never block sign-off
- Job lifecycle: created at point of sale (design import preferred, Pylon first), populated by the office over weeks (DNSP/DERR references, equipment list), installer assigned at scheduling; installers only ever see assigned jobs; DNSP approval reference gates install-ready, and no on-site capture begins before install-ready
- Crew model: one Lead Installer per job, designation restricted to vetted qualification sets matching the job type (licence + SAA PV; battery endorsement for battery/hybrid). Lead confirms stages, has final say on gate disputes, signs off the job, and is the CCEW certifier. Crew members capture only — they cannot accept, dispute, or edit non-compliance calls; rectification closure requires the Lead's accredited sign-off
- Non-compliance log: every FAIL (photo + AI response + rectification chain + closure record) preserved immutably, company-admin visible only; customer handover pack shows final compliant state
- Telemetry: first-time pass rate is the headline metric; stage-duration data diagnostic and secondary, never a raw speed leaderboard; job-mix normalised; company-owned per seat consent
