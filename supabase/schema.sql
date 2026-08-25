create extension if not exists "pgcrypto";

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  mode text not null check (mode in ('Practice','Track','Strategy Test')),
  benchmark_symbol text not null default 'SP500TR',
  start_date date not null,
  risk_profile jsonb,
  goal jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  name text,
  category text,
  transaction_type text not null check (transaction_type in ('BUY','SELL','DIVIDEND')),
  trade_date date not null,
  shares numeric not null,
  price numeric not null,
  fees numeric not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  name text,
  category text,
  created_at timestamptz not null default now(),
  unique(portfolio_id,symbol)
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  action text not null,
  confidence text not null,
  reason text not null,
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.performance_snapshots (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot_date date not null,
  portfolio_value numeric not null,
  portfolio_return numeric,
  benchmark_return numeric,
  excess_return numeric,
  max_drawdown numeric,
  annualized_volatility numeric,
  start_date date,
  end_date date,
  observations integer,
  benchmark_symbol text,
  created_at timestamptz not null default now(),
  unique(portfolio_id,snapshot_date)
);

alter table public.portfolios enable row level security;
alter table public.transactions enable row level security;
alter table public.watchlist_items enable row level security;
alter table public.journal_entries enable row level security;
alter table public.performance_snapshots enable row level security;

drop policy if exists "users own portfolios" on public.portfolios;

create policy "users own portfolios"
on public.portfolios for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users own transactions" on public.transactions;

create policy "users own transactions"
on public.transactions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users own watchlist" on public.watchlist_items;

create policy "users own watchlist"
on public.watchlist_items for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users own journal entries" on public.journal_entries;

create policy "users own journal entries"
on public.journal_entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users own performance snapshots" on public.performance_snapshots;

create policy "users own performance snapshots"
on public.performance_snapshots for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists idx_portfolios_user on public.portfolios(user_id);
create index if not exists idx_transactions_portfolio_date on public.transactions(portfolio_id,trade_date);
create index if not exists idx_watchlist_portfolio on public.watchlist_items(portfolio_id);
create index if not exists idx_journal_portfolio on public.journal_entries(portfolio_id);
create index if not exists idx_snapshots_portfolio_date on public.performance_snapshots(portfolio_id,snapshot_date);


create table if not exists public.portfolio_selections (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  name text not null,
  category text not null,
  security_type text not null,
  planned_amount numeric not null check (planned_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(portfolio_id,symbol)
);

alter table public.portfolio_selections enable row level security;

drop policy if exists "users own portfolio selections" on public.portfolio_selections;

create policy "users own portfolio selections"
on public.portfolio_selections for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists idx_portfolio_selections_portfolio
on public.portfolio_selections(portfolio_id);


-- Practice-mode transactions already use the existing `transactions` table.
-- Helpful constraints for simulated trading integrity:
do $$ begin
  if not exists (select 1 from pg_constraint where conname='transactions_positive_shares') then
    alter table public.transactions add constraint transactions_positive_shares check (shares > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname='transactions_nonnegative_price') then
    alter table public.transactions add constraint transactions_nonnegative_price check (price >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname='transactions_nonnegative_fees') then
    alter table public.transactions add constraint transactions_nonnegative_fees check (fees >= 0);
  end if;
end $$;

create index if not exists idx_transactions_symbol
on public.transactions(portfolio_id,symbol);


create table if not exists public.security_score_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  portfolio_id uuid references public.portfolios(id) on delete cascade,
  symbol text not null,
  security_type text not null,
  scoring_method text,
  match_score numeric,
  quality_score numeric,
  estimated_risk numeric,
  score_payload jsonb not null,
  snapshot_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.security_score_snapshots enable row level security;

drop policy if exists "users own score snapshots" on public.security_score_snapshots;

create policy "users own score snapshots"
on public.security_score_snapshots for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists idx_security_score_snapshots_lookup
on public.security_score_snapshots(user_id,portfolio_id,symbol,snapshot_date desc);
