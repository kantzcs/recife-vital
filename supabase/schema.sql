create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('Consulta', 'Retirada', 'Exame')),
  date date not null,
  time text not null,
  location text not null,
  points integer not null default 0,
  confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.appointments enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_delete_own"
on public.profiles
for delete
using (auth.uid() = id);

create policy "appointments_select_own"
on public.appointments
for select
using (auth.uid() = user_id);

create policy "appointments_insert_own"
on public.appointments
for insert
with check (auth.uid() = user_id);

create policy "appointments_update_own"
on public.appointments
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "appointments_delete_own"
on public.appointments
for delete
using (auth.uid() = user_id);

create index if not exists idx_appointments_user_id
on public.appointments(user_id);

create index if not exists idx_appointments_created_at
on public.appointments(created_at desc);
