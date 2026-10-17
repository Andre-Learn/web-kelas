-- XI TJKT-1: database-side validation (audit item C10).
-- NOT applied automatically. Run it in the Supabase SQL editor after schema.sql.
-- Every step checks existing rows first and stops with a clear message instead of changing data.

-- 1. Accent must be one of the approved options (src/data/defaultContent.js ACCENT_OPTIONS).
do $$
begin
  if exists (
    select 1 from public.site_settings
    where data ? 'accent' and data->>'accent' not in ('violet', 'teal', 'rose', 'amber')
  ) then
    raise exception 'site_settings.data.accent holds an unsupported value. Fix it in Appearance settings, then rerun.';
  end if;
end $$;

alter table public.site_settings drop constraint if exists site_settings_accent_check;
alter table public.site_settings add constraint site_settings_accent_check
  check (not (data ? 'accent') or data->>'accent' in ('violet', 'teal', 'rose', 'amber'));

-- 2. Class numbers are unique when set. Duplicates are reported, never deleted.
do $$
declare dupes text;
begin
  select string_agg(class_number::text, ', ') into dupes
  from (select class_number from public.members where class_number is not null group by class_number having count(*) > 1) d;
  if dupes is not null then
    raise exception 'Duplicate member class numbers: %. Fix them in Member settings, then rerun.', dupes;
  end if;
end $$;

create unique index if not exists members_class_number_key on public.members (class_number) where class_number is not null;

-- 3. Storage updates must also stay inside the media bucket and require an admin afterwards.
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());
