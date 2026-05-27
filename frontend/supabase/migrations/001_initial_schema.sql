-- ═══════════════════════════════════════════════════════════════════════════════
-- FinPilot AI — Initial Database Schema
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run this SQL in Supabase Dashboard → SQL Editor

-- ── 1. PROFILES ─────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ── 2. EXPENSES ─────────────────────────────────────────────────────────────

create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category text not null,
  amount numeric not null,
  description text,
  expense_date timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null
);

alter table public.expenses enable row level security;

create policy "Users can view own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- ── 3. BUDGETS ──────────────────────────────────────────────────────────────

create table if not exists public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category text not null,
  spending_limit numeric not null,
  period text not null default 'monthly',
  created_at timestamp with time zone default now() not null
);

alter table public.budgets enable row level security;

create policy "Users can view own budgets"
  on public.budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert own budgets"
  on public.budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own budgets"
  on public.budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete own budgets"
  on public.budgets for delete
  using (auth.uid() = user_id);

-- ── 4. GOALS ────────────────────────────────────────────────────────────────

create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  target_amount numeric not null,
  current_amount numeric default 0 not null,
  deadline date,
  created_at timestamp with time zone default now() not null
);

alter table public.goals enable row level security;

create policy "Users can view own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- ── 5. EMI PLANNER ──────────────────────────────────────────────────────────

create table if not exists public.emi_planner (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text,
  principal numeric not null,
  interest_rate numeric not null,
  tenure_months integer not null,
  emi_amount numeric not null,
  start_date date,
  created_at timestamp with time zone default now() not null
);

alter table public.emi_planner enable row level security;

create policy "Users can view own EMIs"
  on public.emi_planner for select
  using (auth.uid() = user_id);

create policy "Users can insert own EMIs"
  on public.emi_planner for insert
  with check (auth.uid() = user_id);

create policy "Users can update own EMIs"
  on public.emi_planner for update
  using (auth.uid() = user_id);

create policy "Users can delete own EMIs"
  on public.emi_planner for delete
  using (auth.uid() = user_id);

-- ── 6. TRANSACTIONS ─────────────────────────────────────────────────────────

create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  transaction_type text not null,
  amount numeric not null,
  description text,
  category text,
  transaction_date timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- ── 7. AUTO-CREATE PROFILE TRIGGER ──────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 8. INDEXES FOR PERFORMANCE ──────────────────────────────────────────────

create index if not exists idx_expenses_user_id on public.expenses(user_id);
create index if not exists idx_expenses_date on public.expenses(expense_date desc);
create index if not exists idx_budgets_user_id on public.budgets(user_id);
create index if not exists idx_goals_user_id on public.goals(user_id);
create index if not exists idx_emi_planner_user_id on public.emi_planner(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_date on public.transactions(transaction_date desc);

-- ── 9. ENABLE REALTIME ──────────────────────────────────────────────────────

alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.budgets;
alter publication supabase_realtime add table public.goals;
alter publication supabase_realtime add table public.emi_planner;
alter publication supabase_realtime add table public.transactions;
