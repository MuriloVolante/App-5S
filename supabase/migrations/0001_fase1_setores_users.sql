-- Fase 1: setores, users, codigos sequenciais, auth por papel

create type public.papel_usuario as enum ('lider', 'coordenador', 'admin');

create sequence public.setores_codigo_seq;
create sequence public.users_codigo_seq;

create table public.setores (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null default 'SET-' || lpad(nextval('public.setores_codigo_seq')::text, 4, '0'),
  nome text not null,
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  codigo text unique not null default 'USR-' || lpad(nextval('public.users_codigo_seq')::text, 4, '0'),
  nome text not null,
  email text unique not null,
  papel public.papel_usuario not null,
  setor_id uuid references public.setores (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint users_setor_por_papel check (
    (papel = 'admin' and setor_id is null) or (papel <> 'admin' and setor_id is not null)
  )
);

create index users_setor_id_idx on public.users (setor_id);

-- papel do usuario autenticado sem recursao de RLS
create or replace function public.papel_atual()
returns public.papel_usuario
language sql
stable
security definer
set search_path = public
as $$
  select papel from public.users where id = auth.uid();
$$;

alter table public.setores enable row level security;
alter table public.users enable row level security;

create policy setores_select_autenticado on public.setores
  for select to authenticated using (true);

create policy setores_admin_all on public.setores
  for all to authenticated
  using (public.papel_atual() = 'admin')
  with check (public.papel_atual() = 'admin');

create policy users_select_proprio on public.users
  for select to authenticated using (id = auth.uid());

create policy users_admin_all on public.users
  for all to authenticated
  using (public.papel_atual() = 'admin')
  with check (public.papel_atual() = 'admin');
