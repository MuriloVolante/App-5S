-- Fase 4: execucao de checklist (instancias, respostas e fotos)

create type public.status_checklist as enum ('aberto', 'finalizado');

create sequence public.checklists_codigo_seq;

create table public.checklists (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null default 'CHK-' || lpad(nextval('public.checklists_codigo_seq')::text, 4, '0'),
  setor_id uuid not null references public.setores (id) on delete restrict,
  lider_id uuid not null references public.users (id) on delete restrict,
  template_id uuid not null references public.checklist_templates (id) on delete restrict,
  data_criacao timestamptz not null default now(),
  status public.status_checklist not null default 'aberto',
  finalizado_em timestamptz
);

create index checklists_setor_id_idx on public.checklists (setor_id, status);

create table public.checklist_respostas (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.checklists (id) on delete cascade,
  item_id uuid not null references public.checklist_items (id) on delete restrict,
  conforme boolean not null,
  observacao text,
  foto_url text,
  created_at timestamptz not null default now(),
  unique (checklist_id, item_id),
  constraint respostas_nao_conforme_exige_evidencia check (
    conforme or (observacao is not null and length(btrim(observacao)) > 0 and foto_url is not null)
  )
);

create index checklist_respostas_checklist_id_idx on public.checklist_respostas (checklist_id);

alter table public.checklists enable row level security;
alter table public.checklist_respostas enable row level security;

create policy checklists_select_setor on public.checklists
  for select to authenticated
  using (public.papel_atual() = 'admin' or setor_id = public.setor_atual());

create policy checklists_insert_lider on public.checklists
  for insert to authenticated
  with check (
    public.papel_atual() = 'lider'
    and lider_id = auth.uid()
    and setor_id = public.setor_atual()
  );

create policy checklists_update_lider on public.checklists
  for update to authenticated
  using (
    public.papel_atual() = 'lider'
    and lider_id = auth.uid()
    and status = 'aberto'
  )
  with check (public.papel_atual() = 'lider' and lider_id = auth.uid());

create policy respostas_select_setor on public.checklist_respostas
  for select to authenticated
  using (
    exists (
      select 1 from public.checklists c
      where c.id = checklist_id
        and (public.papel_atual() = 'admin' or c.setor_id = public.setor_atual())
    )
  );

create policy respostas_escrita_lider on public.checklist_respostas
  for all to authenticated
  using (
    exists (
      select 1 from public.checklists c
      where c.id = checklist_id and c.lider_id = auth.uid() and c.status = 'aberto'
    )
  )
  with check (
    exists (
      select 1 from public.checklists c
      where c.id = checklist_id and c.lider_id = auth.uid() and c.status = 'aberto'
    )
  );

-- Storage das fotos de nao conformidade
insert into storage.buckets (id, name, public)
values ('checklist-fotos', 'checklist-fotos', true)
on conflict (id) do nothing;

create policy fotos_leitura_publica on storage.objects
  for select using (bucket_id = 'checklist-fotos');

create policy fotos_upload_autenticado on storage.objects
  for insert to authenticated
  with check (bucket_id = 'checklist-fotos');
