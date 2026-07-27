/**
 * Stage-gate definitions (spec: Stage 0 → Stage 10).
 *
 * This is the canonical checklist tree for grid-connected rooftop PV
 * (residential, single/three-phase). The battery addendum (AS/NZS 5139) is a
 * separate pack keyed off system type at job creation — deferred to v1.1.
 *
 * Clause numbers are deliberately omitted: Standards Australia text is
 * copyrighted and clause numbering shifts between editions. The verification
 * engine references clauses at runtime against a licensed standards copy; it
 * never reproduces standards text. (spec: Standards verification note)
 */

export interface RequiredPhoto {
  /** Stable key, unique within the stage. */
  key: string;
  label: string;
  /** Roof-type or system-type scoping, where the photo is conditional. */
  appliesWhen?: string;
}

export interface StageDefinition {
  /** 0–10. */
  index: number;
  key: string;
  title: string;
  purpose: string;
  requiredPhotos: RequiredPhoto[];
  /** True where a hard gate blocks all later stages until this one completes. */
  hardGate: boolean;
  /** Whether this stage's rules load from the job's equipment list (manufacturer specs). */
  equipmentDriven: boolean;
}

export const STAGES: readonly StageDefinition[] = [
  {
    index: 0,
    key: 'setup_prestart',
    title: 'Job setup & pre-start',
    purpose: 'Establish site context and safety baseline before work begins.',
    hardGate: true,
    equipmentDriven: false,
    requiredPhotos: [
      { key: 'roof_ground', label: 'Whole roof from ground level (array location visible)' },
      { key: 'condition_survey', label: 'Pre-existing roof condition survey — wide shots per plane + close-ups of every visible defect' },
      { key: 'switchboard_open', label: 'Existing switchboard, cover open — full board visible' },
      { key: 'meter_box', label: 'Meter box / metering arrangement' },
      { key: 'fall_protection', label: 'Roof access & fall protection in place' },
    ],
  },
  {
    index: 1,
    key: 'fixings_penetrations',
    title: 'Roof fixings & penetrations',
    purpose: 'The most litigated defect class — leaks. Invisible once panels go on.',
    hardGate: true,
    equipmentDriven: false,
    requiredPhotos: [
      { key: 'bracket_fixing', label: 'Bracket/foot fixed into rafter/batten — min one per row + atypical fixings' },
      { key: 'penetration_sealed', label: 'Every roof penetration sealed/flashed' },
      { key: 'tile_handling', label: 'Ground/cut tiles reseated correctly', appliesWhen: 'roof_type=tile' },
      { key: 'layout_wide', label: 'Wide shot of completed fixing layout before rails' },
    ],
  },
  {
    index: 2,
    key: 'racking_rails',
    title: 'Racking & rails',
    purpose: 'Structural integrity and array frame bonding.',
    hardGate: false,
    equipmentDriven: true,
    requiredPhotos: [
      { key: 'spans_overhangs', label: 'Rail spans and overhangs — wide shot per roof plane, fixings visible' },
      { key: 'fixing_spacing', label: 'Fixing/foot spacing along rail — consecutive fixings measurable' },
      { key: 'splice', label: 'Rail splice/joiner close-up (each splice)' },
      { key: 'bonding_lug', label: 'Earth/bonding lug on rail — corrosion protection visible (per rail run)' },
    ],
  },
  {
    index: 3,
    key: 'dc_wiring',
    title: 'DC wiring (pre-panel)',
    purpose: 'Cable runs get covered by the array — capture before they disappear.',
    hardGate: false,
    equipmentDriven: false,
    requiredPhotos: [
      { key: 'cable_runs', label: 'DC cable runs on roof — supported, protected, UV-rated enclosure where required' },
      { key: 'roof_entry', label: 'Roof entry point (dektite/gland) sealed' },
      { key: 'ceiling_route', label: 'Cable route through ceiling space where accessible' },
      { key: 'labelling', label: 'Cable labelling at key points' },
    ],
  },
  {
    index: 4,
    key: 'panels_serials',
    title: 'Panel installation & serial capture',
    purpose: 'Correct mechanical mounting plus STC evidence capture (rebate audit file).',
    hardGate: false,
    equipmentDriven: true,
    requiredPhotos: [
      { key: 'serial', label: 'Serial number / barcode of every panel (barcode scan preferred)' },
      { key: 'clamp_positions', label: 'Clamp positions within manufacturer clamp zones (mid + end, per row)' },
      { key: 'array_plane', label: 'Completed array per roof plane — alignment, no overhang beyond rail design' },
      { key: 'panel_bonding', label: 'Panel-to-panel bonding where earthing method requires it' },
    ],
  },
  {
    index: 5,
    key: 'earthing_bonding',
    title: 'Earthing & bonding completion',
    purpose: 'Continuous, mechanically sound earth path for the array system.',
    hardGate: false,
    equipmentDriven: false,
    requiredPhotos: [
      { key: 'main_earth', label: 'Main earthing connection — lug, conductor size readable' },
      { key: 'continuity_path', label: 'Continuity path connections (rail-to-rail, plane-to-plane)' },
      { key: 'earth_termination', label: 'Earth conductor route and termination at switchboard end' },
    ],
  },
  {
    index: 6,
    key: 'inverter_isolation',
    title: 'Inverter & isolation devices',
    purpose: 'Termination photos before lids/covers close — invisible-forever class.',
    hardGate: false,
    equipmentDriven: true,
    requiredPhotos: [
      { key: 'inverter_mounted', label: 'Inverter mounted — clearances, weather protection per manufacturer' },
      { key: 'dc_terminations', label: 'DC terminations at inverter/isolator — lid open, seating visible' },
      { key: 'ac_isolator', label: 'AC isolator adjacent to inverter — terminations before cover on' },
      { key: 'rooftop_isolation', label: 'Rooftop isolation arrangement per AS/NZS 5033 edition in force' },
      { key: 'entries_sealed', label: 'Conduit/cable entries into inverter glanded and sealed' },
    ],
  },
  {
    index: 7,
    key: 'switchboard_ac',
    title: 'Switchboard & AC connection',
    purpose: 'AC-side connection, protection and board schedule.',
    hardGate: false,
    equipmentDriven: false,
    requiredPhotos: [
      { key: 'solar_main_switch', label: 'Solar supply main switch installed and labelled' },
      { key: 'protection_device', label: 'Circuit protection device — rating legible' },
      { key: 'board_terminations', label: 'Terminations at board (before cover refit)' },
      { key: 'board_complete', label: 'Completed board with cover on, updated circuit schedule visible' },
    ],
  },
  {
    index: 8,
    key: 'signage_labelling',
    title: 'Signage & labelling',
    purpose: 'Most common minor-defect class in audits — the easiest AI win.',
    hardGate: false,
    equipmentDriven: false,
    requiredPhotos: [
      { key: 'switchboard_signage', label: 'Main switchboard signage set (PV on premises, solar main switch, dual supply)' },
      { key: 'inverter_labels', label: 'Inverter labels (shutdown procedure adjacent)' },
      { key: 'dc_isolator_labels', label: 'DC isolator/cable labelling' },
      { key: 'metering_labels', label: 'Battery-ready or metering labels where applicable' },
    ],
  },
  {
    index: 9,
    key: 'testing_commissioning',
    title: 'Testing & commissioning',
    purpose: 'Convert the test process itself into tamper-evident evidence.',
    hardGate: false,
    equipmentDriven: false,
    requiredPhotos: [
      { key: 'voc', label: 'Instrument display: array open-circuit voltage (Voc) per string, with string label' },
      { key: 'insulation_resistance', label: 'Instrument display: insulation resistance result' },
      { key: 'earth_continuity', label: 'Instrument display: earth continuity result' },
      { key: 'inverter_region', label: 'Inverter display: region setting + export limit per DNSP approval' },
      { key: 'polarity', label: 'Polarity verification at final connection' },
    ],
  },
  {
    index: 10,
    key: 'handover_signoff',
    title: 'Handover, admin close-out & sign-off',
    purpose: 'All admin executed at sign-off; crew leaves site with nothing on the desk.',
    hardGate: false,
    equipmentDriven: false,
    requiredPhotos: [
      { key: 'final_array', label: 'Final completed array (each plane) + inverter operating (generation display)' },
      { key: 'site_tidy', label: 'Site tidy shot' },
      { key: 'post_work_condition', label: 'Post-work roof condition — same planes/access as Stage 0, before/after comparison' },
      { key: 'handover_pack', label: 'Customer handover pack (manuals, warranty docs, shutdown procedure)' },
    ],
  },
] as const;

export type StageKey = (typeof STAGES)[number]['key'];

export function getStage(index: number): StageDefinition | undefined {
  return STAGES.find((s) => s.index === index);
}
