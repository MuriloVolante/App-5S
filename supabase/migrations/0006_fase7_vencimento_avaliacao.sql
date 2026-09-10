-- Fase 7: vencimento de prazo e avaliacao do lider

-- Marca como vencida toda acao com prazo anterior a hoje.
create or replace function public.aplicar_vencimentos()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  afetadas int;
begin
  update public.acoes
  set status = 'vencida'
  where status = 'com_prazo' and prazo < current_date;

  get diagnostics afetadas = row_count;
  return afetadas;
end;
$$;

create or replace function public.concluir_acao(acao_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  usuario public.users%rowtype;
  acao public.acoes%rowtype;
begin
  select * into usuario from public.users where id = auth.uid();
  if usuario.papel <> 'lider' then
    raise exception 'Apenas o lider do setor pode concluir a acao.';
  end if;

  select * into acao from public.acoes where id = acao_id;
  if acao.id is null or acao.setor_id <> usuario.setor_id then
    raise exception 'Acao fora do seu setor.';
  end if;
  if acao.status <> 'vencida' then
    raise exception 'Apenas acoes vencidas podem ser avaliadas.';
  end if;

  update public.acoes
  set status = 'concluida',
      concluido_em = now(),
      concluido_por = usuario.id
  where id = acao_id;
end;
$$;

create or replace function public.resetar_acao(acao_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  usuario public.users%rowtype;
  acao public.acoes%rowtype;
begin
  select * into usuario from public.users where id = auth.uid();
  if usuario.papel <> 'lider' then
    raise exception 'Apenas o lider do setor pode resetar a acao.';
  end if;

  select * into acao from public.acoes where id = acao_id;
  if acao.id is null or acao.setor_id <> usuario.setor_id then
    raise exception 'Acao fora do seu setor.';
  end if;
  if acao.status <> 'vencida' then
    raise exception 'Apenas acoes vencidas podem ser avaliadas.';
  end if;

  update public.acoes
  set status = 'aberta',
      prazo = null,
      reset_count = reset_count + 1
  where id = acao_id;
end;
$$;

grant execute on function public.aplicar_vencimentos() to authenticated;
grant execute on function public.concluir_acao(uuid) to authenticated;
grant execute on function public.resetar_acao(uuid) to authenticated;
