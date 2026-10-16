-- XI TJKT-1 — Supabase schema and access policies.
-- Run in the Supabase SQL editor. Then add administrators manually:
--   1. Create the user in Authentication > Users (public sign-ups should be disabled).
--   2. insert into public.admins (user_id) values ('<auth user uuid>');

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.officers (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  role text not null,
  tier text not null default 'officer' check (tier in ('teacher', 'core', 'officer')),
  description text,
  photo_url text,
  photo_path text,
  sort_order int not null default 0
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  class_number int,
  intro text,
  photo_url text,
  photo_thumb_url text,
  photo_path text,
  sort_order int not null default 0
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  thumb_url text,
  storage_path text,
  width int,
  height int,
  caption text,
  alt_text text,
  taken_on date,
  category text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.officers enable row level security;
alter table public.members enable row level security;
alter table public.gallery_images enable row level security;

-- admins: a user can only see whether they themselves are an admin. No client writes.
drop policy if exists "admins read own row" on public.admins;
create policy "admins read own row" on public.admins for select to authenticated using (user_id = auth.uid());

-- Public content: everyone reads, only admins write.
do $$
declare t text;
begin
  foreach t in array array['site_settings', 'officers', 'members', 'gallery_images'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Storage: public-read bucket, admin-only uploads and deletes, images only, 8 MB limit.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
