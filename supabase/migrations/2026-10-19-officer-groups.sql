-- Officer groups and deputies (organisation chart redesign).
-- Backward compatible and non-destructive: adds two columns to public.officers and touches no existing row.
-- Existing RLS policies ("public read", "admin write") already cover every column, so they are unchanged.
-- Run once in the Supabase SQL editor. Re-running is safe.

-- group_name: officers that share a (case-insensitive) name inside the same level are drawn in one framed group,
--             e.g. 'Secretary'. NULL means the position stands alone in the chart.
alter table public.officers add column if not exists group_name text;

-- is_deputy: true marks a deputy of the primary position(s) in the same group, e.g. 'Wakil Sekretaris'.
alter table public.officers add column if not exists is_deputy boolean not null default false;

alter table public.officers drop constraint if exists officers_group_name_length;
alter table public.officers add constraint officers_group_name_length
  check (group_name is null or char_length(group_name) <= 60);

-- OPTIONAL one-time backfill for the seven positions the class has today. It is NOT run automatically.
-- It only fills rows whose group_name is still empty and whose role matches exactly (case-insensitive),
-- so it never overwrites anything an administrator has already set. Review, then uncomment to use it.
--
-- update public.officers set group_name = 'Class leadership'
--   where group_name is null and tier = 'core' and lower(role) in ('ketua kelas', 'wakil ketua kelas');
-- update public.officers set is_deputy = true
--   where lower(role) in ('wakil ketua kelas', 'wakil sekretaris', 'wakil bendahara');
-- update public.officers set group_name = 'Secretary'
--   where group_name is null and tier = 'officer' and lower(role) in ('sekretaris', 'wakil sekretaris');
-- update public.officers set group_name = 'Treasurer'
--   where group_name is null and tier = 'officer' and lower(role) in ('bendahara', 'wakil bendahara');
