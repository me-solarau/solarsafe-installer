-- Fixed reference data: Stage 0 through Stage 10, per the stage-gate spec.
-- This belongs in a migration (applies to every environment, prod included),
-- not supabase/seed.sql (which is local-dev fake data only).

insert into public.stages (id, key, name, sequence) values
  (0, 'pre_start', 'Job setup & pre-start', 0),
  (1, 'roof_fixings', 'Roof fixings & penetrations', 1),
  (2, 'racking_rails', 'Racking & rails', 2),
  (3, 'dc_wiring', 'DC wiring (pre-panel)', 3),
  (4, 'panel_install', 'Panel installation & serial capture', 4),
  (5, 'earthing_bonding', 'Earthing & bonding completion', 5),
  (6, 'inverter_isolation', 'Inverter & isolation devices', 6),
  (7, 'switchboard_ac', 'Switchboard & AC connection', 7),
  (8, 'signage_labelling', 'Signage & labelling', 8),
  (9, 'testing_commissioning', 'Testing & commissioning', 9),
  (10, 'handover_closeout', 'Handover, admin close-out & sign-off', 10)
on conflict (id) do nothing;
