import { consultar, consultarUm, emTransacao, executar, hoje } from "@/lib/db";
import { gerarHash } from "@/lib/senha";
import type {
  Acao,
  AppUser,
  Checklist,
  ChecklistItem,
  ChecklistResposta,
  ChecklistTemplate,
  Papel,
  Setor,
  StatusAcao,
  StatusChecklist,
} from "@/types";

export const POR_PAGINA = 20;

export type Pagina<T> = {
  itens: T[];
  total: number;
  pagina: number;
  paginas: number;
};

async function consultarPagina<T>(
  sqlItens: string,
  sqlTotal: string,
  parametros: unknown[],
  pagina: number,
  porPagina = POR_PAGINA
): Promise<Pagina<T>> {
  const linha = await consultarUm<{ total: number }>(sqlTotal, parametros);
  const total = linha?.total ?? 0;

  const paginas = Math.max(1, Math.ceil(total / porPagina));
  const atual = Math.min(Math.max(1, Math.trunc(pagina) || 1), paginas);

  const itens = await consultar<T>(
    `${sqlItens} limit $${parametros.length + 1} offset $${parametros.length + 2}`,
    [...parametros, porPagina, (atual - 1) * porPagina]
  );

  return { itens, total, pagina: atual, paginas };
}

/* setores */

// lista completa, usada nos seletores de formulario
export function listarSetores() {
  return consultar<Setor>("select * from setores order by codigo limit 500");
}

export function listarSetoresPagina(pagina = 1) {
  return consultarPagina<Setor>(
    "select * from setores order by codigo",
    "select count(*)::int as total from setores",
    [],
    pagina
  );
}

export function criarSetor(nome: string) {
  return executar("insert into setores (nome) values ($1)", [nome]);
}

export function atualizarSetor(id: string, nome: string) {
  return executar("update setores set nome = $1 where id = $2", [nome, id]);
}

export async function excluirSetor(id: string) {
  const vinculos = await consultarUm<{ usuarios: number; templates: number }>(
    `select
       (select count(*)::int from users where setor_id = $1) as usuarios,
       (select count(*)::int from checklist_templates where setor_id = $1) as templates`,
    [id]
  );

  if ((vinculos?.usuarios ?? 0) > 0) return "Setor possui usuários vinculados.";
  if ((vinculos?.templates ?? 0) > 0)
    return "Setor possui checklists vinculados.";

  await executar("delete from setores where id = $1", [id]);
  return null;
}

/* usuarios */

export function listarUsuarios(pagina = 1) {
  return consultarPagina<AppUser>(
    "select id, codigo, nome, email, papel, setor_id, criado_em from users order by codigo",
    "select count(*)::int as total from users",
    [],
    pagina
  );
}

export async function contarUsuariosSemPapel() {
  const linha = await consultarUm<{ total: number }>(
    "select count(*)::int as total from users where papel is null"
  );
  return linha?.total ?? 0;
}

export async function contarUsuarios() {
  const linha = await consultarUm<{ total: number }>(
    "select count(*)::int as total from users"
  );
  return linha?.total ?? 0;
}

export function buscarUsuarioPorEmail(email: string) {
  return consultarUm<AppUser & { senha_hash: string }>(
    "select * from users where email = $1",
    [email]
  );
}

export async function criarUsuario(entrada: {
  nome: string;
  email: string;
  senha: string;
  papel: Papel | null;
  setorId: string | null;
}) {
  if (await buscarUsuarioPorEmail(entrada.email)) return "E-mail já cadastrado.";

  const linha = await consultarUm<{ id: string }>(
    `insert into users (nome, email, senha_hash, papel, setor_id)
     values ($1, $2, $3, $4, $5) returning id`,
    [
      entrada.nome,
      entrada.email,
      gerarHash(entrada.senha),
      entrada.papel,
      entrada.setorId,
    ]
  );

  return linha!.id;
}

export function atualizarUsuario(
  id: string,
  dados: { nome: string; papel: Papel | null; setorId: string | null }
) {
  return executar(
    "update users set nome = $1, papel = $2, setor_id = $3 where id = $4",
    [dados.nome, dados.papel, dados.setorId, id]
  );
}

export async function excluirUsuario(id: string) {
  const vinculos = await consultarUm<{ checklists: number; acoes: number }>(
    `select
       (select count(*)::int from checklists where criado_por = $1 or preenchido_por = $1) as checklists,
       (select count(*)::int from acoes where aberto_por = $1 or concluido_por = $1) as acoes`,
    [id]
  );

  if ((vinculos?.checklists ?? 0) > 0 || (vinculos?.acoes ?? 0) > 0)
    return "Usuário possui checklists ou ações vinculadas.";

  await executar("delete from users where id = $1", [id]);
  return null;
}

/* templates e itens */

export function listarTemplates(pagina = 1) {
  return consultarPagina<ChecklistTemplate>(
    "select * from checklist_templates order by codigo",
    "select count(*)::int as total from checklist_templates",
    [],
    pagina
  );
}

export function listarTemplatesDoSetor(setorId: string, pagina = 1) {
  return consultarPagina<ChecklistTemplate>(
    "select * from checklist_templates where setor_id = $1 order by codigo",
    "select count(*)::int as total from checklist_templates where setor_id = $1",
    [setorId],
    pagina
  );
}

// usados pelo auditor, que enxerga todos os setores
export function listarTemplatesComSetor(pagina = 1) {
  return consultarPagina<
    ChecklistTemplate & { setor_codigo: string; setor_nome: string }
  >(
    `select t.*, s.codigo as setor_codigo, s.nome as setor_nome
     from checklist_templates t join setores s on s.id = t.setor_id
     order by s.codigo, t.codigo`,
    "select count(*)::int as total from checklist_templates",
    [],
    pagina
  );
}

export function listarChecklistsGlobaisPorStatus(
  status: StatusChecklist,
  pagina = 1,
  porPagina = POR_PAGINA
) {
  return consultarPagina<Checklist>(
    "select * from checklists where status = $1 order by data_criacao desc",
    "select count(*)::int as total from checklists where status = $1",
    [status],
    pagina,
    porPagina
  );
}

export async function listarAcoesVencidasGlobais(pagina = 1) {
  await aplicarVencimentos();
  return consultarPagina<Acao>(
    "select * from acoes where status = 'vencida' order by prazo",
    "select count(*)::int as total from acoes where status = 'vencida'",
    [],
    pagina
  );
}

export async function contarAcoesVencidasGlobais() {
  await aplicarVencimentos();
  const linha = await consultarUm<{ total: number }>(
    "select count(*)::int as total from acoes where status = 'vencida'"
  );
  return linha?.total ?? 0;
}

export function obterTemplate(id: string) {
  return consultarUm<ChecklistTemplate>(
    "select * from checklist_templates where id = $1",
    [id]
  );
}

export function criarTemplate(nome: string, setorId: string) {
  return executar(
    "insert into checklist_templates (setor_id, nome) values ($1, $2)",
    [setorId, nome]
  );
}

export function atualizarTemplate(id: string, nome: string, setorId: string) {
  return executar(
    "update checklist_templates set nome = $1, setor_id = $2 where id = $3",
    [nome, setorId, id]
  );
}

export async function excluirTemplate(id: string) {
  const linha = await consultarUm<{ total: number }>(
    "select count(*)::int as total from checklists where template_id = $1",
    [id]
  );

  if ((linha?.total ?? 0) > 0) return "Checklist possui auditorias vinculadas.";

  await executar("delete from checklist_templates where id = $1", [id]);
  return null;
}

// lista completa: a execucao da auditoria precisa de todos os itens
export function listarItens(templateId: string) {
  return consultar<ChecklistItem>(
    "select * from checklist_items where template_id = $1 order by ordem, codigo",
    [templateId]
  );
}

export function listarItensPagina(templateId: string, pagina = 1) {
  return consultarPagina<ChecklistItem>(
    "select * from checklist_items where template_id = $1 order by ordem, codigo",
    "select count(*)::int as total from checklist_items where template_id = $1",
    [templateId],
    pagina
  );
}

export async function contarItens(templateId: string) {
  const linha = await consultarUm<{ total: number }>(
    "select count(*)::int as total from checklist_items where template_id = $1",
    [templateId]
  );
  return linha?.total ?? 0;
}

export function criarItem(templateId: string, descricao: string, ordem: number) {
  return executar(
    "insert into checklist_items (template_id, descricao, ordem) values ($1, $2, $3)",
    [templateId, descricao, ordem]
  );
}

export function atualizarItem(id: string, descricao: string, ordem: number) {
  return executar(
    "update checklist_items set descricao = $1, ordem = $2 where id = $3",
    [descricao, ordem, id]
  );
}

export async function excluirItem(id: string) {
  const linha = await consultarUm<{ total: number }>(
    "select count(*)::int as total from checklist_respostas where item_id = $1",
    [id]
  );

  if ((linha?.total ?? 0) > 0) return "Item possui respostas registradas.";

  await executar("delete from checklist_items where id = $1", [id]);
  return null;
}

/* checklists */

export async function criarChecklist(
  templateId: string,
  setorId: string,
  criadoPor: string
) {
  const linha = await consultarUm<{ id: string }>(
    `insert into checklists (setor_id, criado_por, template_id, status)
     values ($1, $2, $3, 'aberto') returning id`,
    [setorId, criadoPor, templateId]
  );

  return linha!.id;
}

export function obterChecklist(id: string) {
  return consultarUm<Checklist>("select * from checklists where id = $1", [id]);
}

export function respostasDoChecklist(checklistId: string) {
  return consultar<ChecklistResposta>(
    "select * from checklist_respostas where checklist_id = $1",
    [checklistId]
  );
}

export async function salvarResposta(entrada: {
  checklistId: string;
  itemId: string;
  auditorId: string;
  conforme: boolean;
  observacao?: string | null;
  fotoUrl?: string | null;
}) {
  const observacao = entrada.conforme ? null : (entrada.observacao ?? "").trim();
  const fotoUrl = entrada.conforme ? null : entrada.fotoUrl ?? null;

  if (!entrada.conforme && (!observacao || !fotoUrl))
    return "Não conformidade exige descrição e foto.";

  await executar(
    `insert into checklist_respostas (checklist_id, item_id, conforme, observacao, foto_url)
     values ($1, $2, $3, $4, $5)
     on conflict (checklist_id, item_id) do update
       set conforme = excluded.conforme,
           observacao = excluded.observacao,
           foto_url = excluded.foto_url`,
    [entrada.checklistId, entrada.itemId, entrada.conforme, observacao, fotoUrl]
  );

  await executar("update checklists set preenchido_por = $1 where id = $2", [
    entrada.auditorId,
    entrada.checklistId,
  ]);

  return null;
}

export async function finalizarChecklist(
  checklistId: string,
  auditorId: string
) {
  const checklist = await obterChecklist(checklistId);
  if (!checklist) return "Checklist inválido.";
  if (checklist.status === "finalizado") return "Checklist já finalizado.";

  const [itens, respostas] = await Promise.all([
    contarItens(checklist.template_id),
    respostasDoChecklist(checklistId),
  ]);

  if (itens === 0) return "Checklist sem itens.";
  if (respostas.length < itens)
    return "Responda todos os itens antes de finalizar.";

  await emTransacao(async (executarSql) => {
    await executarSql(
      `update checklists
         set status = 'finalizado', finalizado_em = now(), preenchido_por = $1
       where id = $2`,
      [auditorId, checklistId]
    );

    await executarSql(
      `insert into acoes (resposta_id, setor_id, descricao_problema, foto_url, aberto_por)
       select r.id, $1, r.observacao, r.foto_url, $2
       from checklist_respostas r
       where r.checklist_id = $3 and r.conforme = false
       on conflict (resposta_id) do nothing`,
      [checklist.setor_id, auditorId, checklistId]
    );
  });

  return null;
}

/* acoes */

export function aplicarVencimentos() {
  return executar(
    "update acoes set status = 'vencida' where status = 'com_prazo' and prazo < $1",
    [hoje()]
  );
}

export async function listarAcoesDoSetor(setorId: string, pagina = 1) {
  await aplicarVencimentos();
  return consultarPagina<Acao>(
    `select * from acoes where setor_id = $1
     order by case status
       when 'aberta' then 0 when 'vencida' then 1 when 'com_prazo' then 2 else 3
     end, aberto_em desc`,
    "select count(*)::int as total from acoes where setor_id = $1",
    [setorId],
    pagina
  );
}

/* indicadores do dashboard (agregacao no banco, sem carregar as linhas) */

export type ResumoSetor = {
  setor_id: string;
  aberta: number;
  com_prazo: number;
  vencida: number;
  concluida: number;
  total: number;
};

export async function resumoAcoesPorSetor(
  setorId: string | null | undefined,
  pagina = 1,
  porPagina = 10
) {
  await aplicarVencimentos();
  const filtro = setorId ? "where setor_id = $1" : "";
  const parametros = setorId ? [setorId] : [];

  return consultarPagina<ResumoSetor>(
    `select setor_id,
            count(*) filter (where status = 'aberta')::int as aberta,
            count(*) filter (where status = 'com_prazo')::int as com_prazo,
            count(*) filter (where status = 'vencida')::int as vencida,
            count(*) filter (where status = 'concluida')::int as concluida,
            count(*)::int as total
     from acoes ${filtro}
     group by setor_id
     order by total desc`,
    `select count(*)::int as total from (
       select setor_id from acoes ${filtro} group by setor_id
     ) as setores_com_acoes`,
    parametros,
    pagina,
    porPagina
  );
}

export async function indicadoresAcoes(setorId?: string | null) {
  await aplicarVencimentos();
  const filtro = setorId ? "where setor_id = $1" : "";
  const parametros = setorId ? [setorId] : [];

  const linha = await consultarUm<{
    total: number;
    abertas: number;
    com_prazo: number;
    concluidas: number;
    vencidas: number;
    reincidentes: number;
    media_dias: number | null;
  }>(
    `select
       count(*)::int as total,
       count(*) filter (where status = 'aberta')::int as abertas,
       count(*) filter (where status = 'com_prazo')::int as com_prazo,
       count(*) filter (where status = 'concluida')::int as concluidas,
       count(*) filter (where status = 'vencida')::int as vencidas,
       count(*) filter (where reset_count > 0)::int as reincidentes,
       avg(
         case when status = 'concluida' and concluido_em is not null
           then extract(epoch from (concluido_em - aberto_em)) / 86400
         end
       ) as media_dias
     from acoes ${filtro}`,
    parametros
  );

  return {
    total: linha?.total ?? 0,
    porStatus: {
      aberta: linha?.abertas ?? 0,
      com_prazo: linha?.com_prazo ?? 0,
      vencida: linha?.vencidas ?? 0,
      concluida: linha?.concluidas ?? 0,
    } as Record<StatusAcao, number>,
    vencidas: linha?.vencidas ?? 0,
    reincidentes: linha?.reincidentes ?? 0,
    mediaDias: linha?.media_dias ?? null,
  };
}

export function tempoMedioPorSetor(
  setorId: string | null | undefined,
  pagina = 1,
  porPagina = 10
) {
  const filtro = setorId
    ? "where status = 'concluida' and concluido_em is not null and setor_id = $1"
    : "where status = 'concluida' and concluido_em is not null";
  const parametros = setorId ? [setorId] : [];

  return consultarPagina<{
    setor_id: string;
    total: number;
    media_dias: number | null;
  }>(
    `select setor_id, count(*)::int as total,
            avg(extract(epoch from (concluido_em - aberto_em)) / 86400) as media_dias
     from acoes ${filtro}
     group by setor_id
     order by media_dias desc`,
    `select count(*)::int as total from (
       select setor_id from acoes ${filtro} group by setor_id
     ) as setores_concluidos`,
    parametros,
    pagina,
    porPagina
  );
}

export async function listarAcoesPorStatus(
  status: StatusAcao,
  setorId: string | null | undefined,
  pagina = 1
) {
  await aplicarVencimentos();
  const filtro = setorId ? "status = $1 and setor_id = $2" : "status = $1";
  const parametros = setorId ? [status, setorId] : [status];

  return consultarPagina<Acao>(
    `select * from acoes where ${filtro} order by prazo`,
    `select count(*)::int as total from acoes where ${filtro}`,
    parametros,
    pagina
  );
}

export function listarAcoesReincidentes(
  setorId: string | null | undefined,
  pagina = 1
) {
  const filtro = setorId ? "reset_count > 0 and setor_id = $1" : "reset_count > 0";
  const parametros = setorId ? [setorId] : [];

  return consultarPagina<Acao>(
    `select * from acoes where ${filtro} order by reset_count desc, aberto_em desc`,
    `select count(*)::int as total from acoes where ${filtro}`,
    parametros,
    pagina
  );
}

export function obterAcao(id: string) {
  return consultarUm<Acao>("select * from acoes where id = $1", [id]);
}

export async function definirPrazo(id: string, prazo: string, setorId: string) {
  const acao = await obterAcao(id);
  if (!acao || acao.setor_id !== setorId) return "Ação fora do seu setor.";
  if (acao.status !== "aberta")
    return "Prazo só pode ser definido em ação aberta.";

  await executar(
    "update acoes set prazo = $1, status = 'com_prazo' where id = $2",
    [prazo, id]
  );
  await aplicarVencimentos();
  return null;
}

export async function concluirAcao(id: string, auditor: AppUser) {
  const acao = await obterAcao(id);
  if (!acao) return "Ação inválida.";
  if (acao.status !== "vencida") return "Apenas ações vencidas são avaliadas.";

  await executar(
    `update acoes set status = 'concluida', concluido_em = now(), concluido_por = $1
     where id = $2`,
    [auditor.id, id]
  );
  return null;
}

export async function resetarAcao(id: string, auditor: AppUser) {
  const acao = await obterAcao(id);
  if (!acao) return "Ação inválida.";
  if (acao.status !== "vencida") return "Apenas ações vencidas são avaliadas.";
  void auditor;

  await executar(
    `update acoes set status = 'aberta', prazo = null, reset_count = reset_count + 1
     where id = $1`,
    [id]
  );
  return null;
}

/* fotos guardadas no proprio banco (o disco do Vercel e efemero) */

export async function guardarFoto(tipo: string, conteudo: Buffer) {
  const linha = await consultarUm<{ id: string }>(
    "insert into fotos (tipo, conteudo) values ($1, $2) returning id",
    [tipo, conteudo]
  );
  return linha!.id;
}

export function obterFoto(id: string) {
  return consultarUm<{ tipo: string; conteudo: Buffer }>(
    "select tipo, conteudo from fotos where id = $1",
    [id]
  );
}
