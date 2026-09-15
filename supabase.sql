-- Supabase SQL Editor에서 실행하세요.
create table if not exists public.bookmarks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text not null default '',
  tags text[] not null default '{}',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists bookmarks_user_url_unique
on public.bookmarks(user_id, lower(regexp_replace(url, '/+$', '')));

create index if not exists bookmarks_user_updated
on public.bookmarks(user_id, updated_at desc);

alter table public.bookmarks enable row level security;

create policy "read own bookmarks" on public.bookmarks
for select using (auth.uid() = user_id);

create policy "insert own bookmarks" on public.bookmarks
for insert with check (auth.uid() = user_id);

create policy "update own bookmarks" on public.bookmarks
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own bookmarks" on public.bookmarks
for delete using (auth.uid() = user_id);