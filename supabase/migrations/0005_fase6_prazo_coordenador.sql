-- Fase 6: coordenador define prazo da acao

create policy acoes_update_coordenador on public.acoes
  for update to authenticated
  using (
    public.papel_atual() = 'coordenador'
    and setor_id = public.setor_atual()
    and status = 'aberta'
  )
  with check (
    public.papel_atual() = 'coordenador'
    and setor_id = public.setor_atual()
    and status = 'com_prazo'
    and prazo is not null
  );
