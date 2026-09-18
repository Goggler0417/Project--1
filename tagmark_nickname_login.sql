-- Tagmark: 닉네임(1글자) ↔ 기존 Supabase 이메일 연결
create table if not exists public.tagmark_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tagmark_profiles enable row level security;
grant select, insert, update, delete on public.tagmark_profiles to authenticated;

drop policy if exists "tagmark_profiles_select_own" on public.tagmark_profiles;
create policy "tagmark_profiles_select_own"
on public.tagmark_profiles for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "tagmark_profiles_insert_own" on public.tagmark_profiles;
create policy "tagmark_profiles_insert_own"
on public.tagmark_profiles for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "tagmark_profiles_update_own" on public.tagmark_profiles;
create policy "tagmark_profiles_update_own"
on public.tagmark_profiles for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create unique index if not exists tagmark_profiles_nickname_lower_idx
on public.tagmark_profiles (lower(nickname));

-- 로그인 전에는 auth.users 이메일을 직접 조회할 수 없으므로
-- SECURITY DEFINER RPC가 닉네임에 대응하는 이메일만 반환한다.
create or replace function public.tagmark_email_by_nickname(p_nickname text)
returns text
language sql
security definer
set search_path = public, auth
as $$
  select u.email
  from auth.users u
  join public.tagmark_profiles p on p.user_id = u.id
  where lower(p.nickname) = lower(trim(p_nickname))
  limit 1;
$$;

revoke all on function public.tagmark_email_by_nickname(text) from public;
grant execute on function public.tagmark_email_by_nickname(text) to anon, authenticated;
