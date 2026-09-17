-- Tagmark: one fixed cloud file per authenticated user
-- Run this in Supabase SQL Editor.

create table if not exists public.tagmark_files (
  user_id uuid not null references auth.users(id) on delete cascade,
  file_id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, file_id)
);

alter table public.tagmark_files enable row level security;

drop policy if exists "tagmark_files_select_own" on public.tagmark_files;
create policy "tagmark_files_select_own"
on public.tagmark_files for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "tagmark_files_insert_own" on public.tagmark_files;
create policy "tagmark_files_insert_own"
on public.tagmark_files for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "tagmark_files_update_own" on public.tagmark_files;
create policy "tagmark_files_update_own"
on public.tagmark_files for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "tagmark_files_delete_own" on public.tagmark_files;
create policy "tagmark_files_delete_own"
on public.tagmark_files for delete
to authenticated
using (auth.uid() = user_id);

-- Realtime: simplest implementation for this first version.
alter publication supabase_realtime add table public.tagmark_files;
