create table if not exists public.research_checkpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  category text not null,
  symbol text not null,
  reason text,
  main_risk text,
  alternative_considered text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(portfolio_id, symbol)
);

alter table public.research_checkpoints enable row level security;

drop policy if exists "research_checkpoints_select_own" on public.research_checkpoints;
create policy "research_checkpoints_select_own"
on public.research_checkpoints for select
using (auth.uid() = user_id);

drop policy if exists "research_checkpoints_insert_own" on public.research_checkpoints;
create policy "research_checkpoints_insert_own"
on public.research_checkpoints for insert
with check (auth.uid() = user_id);

drop policy if exists "research_checkpoints_update_own" on public.research_checkpoints;
create policy "research_checkpoints_update_own"
on public.research_checkpoints for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "research_checkpoints_delete_own" on public.research_checkpoints;
create policy "research_checkpoints_delete_own"
on public.research_checkpoints for delete
using (auth.uid() = user_id);
