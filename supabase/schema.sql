create extension if not exists pgcrypto;
create table if not exists public.libraries(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade unique,display_name text not null default 'My RaevynShelf',slug text unique,is_public boolean not null default false,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.works(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,ao3_work_id bigint,ao3_url text,title text not null,author text,status text not null default 'unread' check(status in('unread','reading','read','want')),rating numeric(3,2),ao3_rating text,word_count integer,language text,chapters text,published_at date,updated_at_ao3 date,completed_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(user_id,ao3_work_id));
create table if not exists public.work_tags(work_id uuid not null references public.works(id) on delete cascade,tag text not null,primary key(work_id,tag));
create table if not exists public.stat_cards(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,library_id uuid not null references public.libraries(id) on delete cascade,share_token text not null unique default encode(gen_random_bytes(12),'hex'),display_name text not null,theme text not null default 'midnight',statistics_snapshot jsonb not null default '{}'::jsonb,is_active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.libraries enable row level security; alter table public.works enable row level security; alter table public.work_tags enable row level security; alter table public.stat_cards enable row level security;
drop policy if exists "own libraries" on public.libraries;
create policy "own libraries" on public.libraries for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "own works" on public.works;
create policy "own works" on public.works for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "own tags" on public.work_tags;
create policy "own tags" on public.work_tags for all using(exists(select 1 from public.works w where w.id=work_id and w.user_id=auth.uid())) with check(exists(select 1 from public.works w where w.id=work_id and w.user_id=auth.uid()));
drop policy if exists "own cards" on public.stat_cards;
create policy "own cards" on public.stat_cards for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create or replace function public.get_public_stat_card(p_token text) returns jsonb language sql security definer set search_path=public as $$ select jsonb_build_object('display_name',display_name,'theme',theme,'statistics_snapshot',statistics_snapshot) from public.stat_cards where share_token=p_token and is_active=true limit 1 $$;
revoke all on function public.get_public_stat_card(text) from public; grant execute on function public.get_public_stat_card(text) to anon,authenticated;


-- Least-privilege Data API grants.
revoke all on table public.libraries, public.works, public.work_tags, public.stat_cards from anon;
grant select, insert, update, delete on table public.libraries, public.works, public.work_tags, public.stat_cards to authenticated;

revoke all on function public.get_public_stat_card(text) from public;
grant execute on function public.get_public_stat_card(text) to anon, authenticated;

create index if not exists works_user_id_idx on public.works(user_id);
create index if not exists stat_cards_user_active_idx on public.stat_cards(user_id, is_active);
