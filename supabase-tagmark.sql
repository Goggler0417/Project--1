-- Tagmark v2.4: one fixed cloud file per authenticated user.
-- Run this entire script once in Supabase SQL Editor.

create table if not exists public.tagmark_files (
  user_id uuid not null references auth.users(id) on delete cascade,
  file_id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, file_id)
);

alter table public.tagmark_files enable row level security;

-- Browser client permissions. RLS below limits access to the signed-in owner.
grant select, insert, update, delete on public.tagmark_files to authenticated;

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

-- Data API exposure for the browser client.
grant usage on schema public to authenticated;

-- Realtime: add the table only if it is not already in the publication.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tagmark_files'
  ) then
    alter publication supabase_realtime add table public.tagmark_files;
  end if;
end $$;

-- Only the latest row is needed for this single-file model.
alter table public.tagmark_files replica identity default;
