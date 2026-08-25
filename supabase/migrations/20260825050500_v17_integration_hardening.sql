alter table public.performance_snapshots
  add column if not exists max_drawdown numeric,
  add column if not exists annualized_volatility numeric,
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists observations integer,
  add column if not exists benchmark_symbol text;

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
