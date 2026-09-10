-- Fase 3: templates de checklist e itens

create sequence public.checklist_templates_codigo_seq;
create sequence public.checklist_items_codigo_seq;

create table public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null default 'TPL-' || lpad(nextval('public.checklist_templates_codigo_seq')::text, 4, '0'),
  setor_id uuid not null references public.setores (id) on delete restrict,
  nome text not null,
  created_at timestamptz not null default now()
);

create index checklist_templates_setor_id_idx on public.checklist_templates (setor_id);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null default 'ITM-' || lpad(nextval('public.checklist_items_codigo_seq')::text, 4, '0'),
  template_id uuid not null references public.checklist_templates (id) on delete cascade,
  descricao text not null,
  ordem int not null default 1,
  created_at timestamptz not null default now()
);

create index checklist_items_template_id_idx on public.checklist_items (template_id, ordem);

-- setor do usuario autenticado, sem recursao de RLS
create or replace function public.setor_atual()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select setor_id from public.users where id = auth.uid();
$$;

alter table public.checklist_templates enable row level security;
alter table public.checklist_items enable row level security;

create policy templates_select_setor on public.checklist_templates
  for select to authenticated
  using (public.papel_atual() = 'admin' or setor_id = public.setor_atual());

create policy templates_admin_all on public.checklist_templates
  for all to authenticated
  using (public.papel_atual() = 'admin')
  with check (public.papel_atual() = 'admin');

create policy items_select_setor on public.checklist_items
  for select to authenticated
  using (
    exists (
      select 1 from public.checklist_templates t
      where t.id = template_id
        and (public.papel_atual() = 'admin' or t.setor_id = public.setor_atual())
    )
  );

create policy items_admin_all on public.checklist_items
  for all to authenticated
  using (public.papel_atual() = 'admin')
  with check (public.papel_atual() = 'admin');
