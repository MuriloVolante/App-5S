-- Fase 5: geracao automatica de acoes ao finalizar checklist

create type public.status_acao as enum ('aberta', 'com_prazo', 'vencida', 'concluida');

create sequence public.acoes_codigo_seq;

create table public.acoes (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null default 'ACA-' || lpad(nextval('public.acoes_codigo_seq')::text, 4, '0'),
  resposta_id uuid not null unique references public.checklist_respostas (id) on delete cascade,
  setor_id uuid not null references public.setores (id) on delete restrict,
  descricao_problema text not null,
  foto_url text not null,
  aberto_por uuid not null references public.users (id) on delete restrict,
  aberto_em timestamptz not null default now(),
  prazo date,
  status public.status_acao not null default 'aberta',
  reset_count int not null default 0,
  concluido_em timestamptz,
  concluido_por uuid references public.users (id) on delete restrict
);

create index acoes_setor_status_idx on public.acoes (setor_id, status);

create or replace function public.gerar_acoes_do_checklist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.acoes (
    resposta_id, setor_id, descricao_problema, foto_url, aberto_por
  )
  select r.id, new.setor_id, r.observacao, r.foto_url, new.lider_id
  from public.checklist_respostas r
  where r.checklist_id = new.id and r.conforme = false
  on conflict (resposta_id) do nothing;

  return new;
end;
$$;

create trigger checklists_gerar_acoes
  after update of status on public.checklists
  for each row
  when (new.status = 'finalizado' and old.status <> 'finalizado')
  execute function public.gerar_acoes_do_checklist();

alter table public.acoes enable row level security;

create policy acoes_select_setor on public.acoes
  for select to authenticated
  using (public.papel_atual() = 'admin' or setor_id = public.setor_atual());
