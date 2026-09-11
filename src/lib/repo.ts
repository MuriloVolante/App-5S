import { conectar, agora, hoje, novoId, proximoCodigo } from "@/lib/db";
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

type Valor = string | number;

function consultarPagina<T>(
  sqlItens: string,
  sqlTotal: string,
  parametros: Valor[],
  pagina: number,
  porPagina = POR_PAGINA
): Pagina<T> {
  const { total } = conectar()
    .prepare(sqlTotal)
    .get<{ total: number }>(...parametros) ?? { total: 0 };

  const paginas = Math.max(1, Math.ceil(total / porPagina));
  const atual = Math.min(Math.max(1, Math.trunc(pagina) || 1), paginas);

  const itens = conectar()
    .prepare(`${sqlItens} limit ? offset ?`)
    .all<T>(...parametros, porPagina, (atual - 1) * porPagina);

  return { itens, total, pagina: atual, paginas };
}

/* setores */

// lista completa, usada nos seletores de formulario
export function listarSetores() {
  return conectar()
    .prepare("select * from setores order by codigo limit 500")
    .all() as Setor[];
}

export function listarSetoresPagina(pagina = 1) {
  return consultarPagina<Setor>(
    "select * from setores order by codigo",
    "select count(*) as total from setores",
    [],
    pagina
  );
}

export function criarSetor(nome: string) {
  conectar().prepare(
    "insert into setores (id, codigo, nome, criado_em) values (?, ?, ?, ?)"
  ).run(novoId(), proximoCodigo("SET"), nome, agora());
}

export function atualizarSetor(id: string, nome: string) {
  conectar().prepare("update setores set nome = ? where id = ?").run(nome, id);
}

export function excluirSetor(id: string) {
  const vinculos = conectar()
    .prepare(
      `select
         (select count(*) from users where setor_id = @id) as usuarios,
         (select count(*) from checklist_templates where setor_id = @id) as templates`
    )
    .get({ id }) as { usuarios: number; templates: number };

  if (vinculos.usuarios > 0) return "Setor possui usuários vinculados.";
  if (vinculos.templates > 0) return "Setor possui templates vinculados.";

  conectar().prepare("delete from setores where id = ?").run(id);
  return null;
}

/* usuarios */

export function listarUsuarios(pagina = 1) {
  return consultarPagina<AppUser>(
    "select id, codigo, nome, email, papel, setor_id, criado_em from users order by codigo",
    "select count(*) as total from users",
    [],
    pagina
  );
}

export function contarUsuariosSemPapel() {
  const linha = conectar()
    .prepare("select count(*) as total from users where papel is null")
    .get<{ total: number }>();
  return linha?.total ?? 0;
}

export function contarUsuarios() {
  const { total } = conectar().prepare("select count(*) as total from users").get() as {
    total: number;
  };
  return total;
}

export function buscarUsuarioPorEmail(email: string) {
  return conectar().prepare("select * from users where email = ?").get(email) as
    | (AppUser & { senha_hash: string })
    | undefined;
}

export function criarUsuario(entrada: {
  nome: string;
  email: string;
  senha: string;
  papel: Papel | null;
  setorId: string | null;
}) {
  if (buscarUsuarioPorEmail(entrada.email)) return "E-mail já cadastrado.";

  const id = novoId();
  conectar().prepare(
    `insert into users (id, codigo, nome, email, senha_hash, papel, setor_id, criado_em)
     values (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    proximoCodigo("USR"),
    entrada.nome,
    entrada.email,
    gerarHash(entrada.senha),
    entrada.papel,
    entrada.setorId,
    agora()
  );

  return id;
}

export function atualizarUsuario(
  id: string,
  dados: { nome: string; papel: Papel | null; setorId: string | null }
) {
  conectar().prepare(
    "update users set nome = ?, papel = ?, setor_id = ? where id = ?"
  ).run(dados.nome, dados.papel, dados.setorId, id);
}

export function excluirUsuario(id: string) {
  const vinculos = conectar()
    .prepare(
      `select
         (select count(*) from checklists where criado_por = @id or preenchido_por = @id) as checklists,
         (select count(*) from acoes where aberto_por = @id or concluido_por = @id) as acoes`
    )
    .get({ id }) as { checklists: number; acoes: number };

  if (vinculos.checklists > 0 || vinculos.acoes > 0)
    return "Usuário possui checklists ou ações vinculadas.";

  conectar().prepare("delete from users where id = ?").run(id);
  return null;
}

/* templates e itens */

export function listarTemplates(pagina = 1) {
  return consultarPagina<ChecklistTemplate>(
    "select * from checklist_templates order by codigo",
    "select count(*) as total from checklist_templates",
    [],
    pagina
  );
}

export function listarTemplatesDoSetor(setorId: string) {
  return conectar()
    .prepare(
      "select * from checklist_templates where setor_id = ? order by codigo"
    )
    .all(setorId) as ChecklistTemplate[];
}

export function obterTemplate(id: string) {
  return conectar()
    .prepare("select * from checklist_templates where id = ?")
    .get(id) as ChecklistTemplate | undefined;
}

export function criarTemplate(nome: string, setorId: string) {
  conectar().prepare(
    "insert into checklist_templates (id, codigo, setor_id, nome, criado_em) values (?, ?, ?, ?, ?)"
  ).run(novoId(), proximoCodigo("TPL"), setorId, nome, agora());
}

export function atualizarTemplate(id: string, nome: string, setorId: string) {
  conectar().prepare(
    "update checklist_templates set nome = ?, setor_id = ? where id = ?"
  ).run(nome, setorId, id);
}

export function excluirTemplate(id: string) {
  const { total } = conectar()
    .prepare("select count(*) as total from checklists where template_id = ?")
    .get(id) as { total: number };

  if (total > 0) return "Template possui checklists vinculados.";

  conectar().prepare("delete from checklist_templates where id = ?").run(id);
  return null;
}

// lista completa: a execucao do checklist precisa de todos os itens
export function listarItens(templateId: string) {
  return conectar()
    .prepare(
      "select * from checklist_items where template_id = ? order by ordem, codigo"
    )
    .all(templateId) as ChecklistItem[];
}

export function listarItensPagina(templateId: string, pagina = 1) {
  return consultarPagina<ChecklistItem>(
    "select * from checklist_items where template_id = ? order by ordem, codigo",
    "select count(*) as total from checklist_items where template_id = ?",
    [templateId],
    pagina
  );
}

export function contarItens(templateId: string) {
  const linha = conectar()
    .prepare("select count(*) as total from checklist_items where template_id = ?")
    .get<{ total: number }>(templateId);
  return linha?.total ?? 0;
}

export function criarItem(templateId: string, descricao: string, ordem: number) {
  conectar().prepare(
    "insert into checklist_items (id, codigo, template_id, descricao, ordem, criado_em) values (?, ?, ?, ?, ?, ?)"
  ).run(novoId(), proximoCodigo("ITM"), templateId, descricao, ordem, agora());
}

export function atualizarItem(id: string, descricao: string, ordem: number) {
  conectar().prepare(
    "update checklist_items set descricao = ?, ordem = ? where id = ?"
  ).run(descricao, ordem, id);
}

export function excluirItem(id: string) {
  const { total } = conectar()
    .prepare("select count(*) as total from checklist_respostas where item_id = ?")
    .get(id) as { total: number };

  if (total > 0) return "Item possui respostas registradas.";

  conectar().prepare("delete from checklist_items where id = ?").run(id);
  return null;
}

/* checklists */

export function criarChecklist(
  templateId: string,
  setorId: string,
  criadoPor: string
) {
  const id = novoId();
  conectar().prepare(
    `insert into checklists (id, codigo, setor_id, criado_por, template_id, data_criacao, status)
     values (?, ?, ?, ?, ?, ?, 'aberto')`
  ).run(id, proximoCodigo("CHK"), setorId, criadoPor, templateId, agora());

  return id;
}

export function obterChecklist(id: string) {
  return conectar().prepare("select * from checklists where id = ?").get(id) as
    | Checklist
    | undefined;
}

export function listarChecklistsDoSetor(setorId: string, pagina = 1) {
  return consultarPagina<Checklist>(
    "select * from checklists where setor_id = ? order by data_criacao desc",
    "select count(*) as total from checklists where setor_id = ?",
    [setorId],
    pagina
  );
}

export function listarChecklistsPorStatus(
  setorId: string,
  status: StatusChecklist,
  pagina = 1,
  porPagina = POR_PAGINA
) {
  return consultarPagina<Checklist>(
    "select * from checklists where setor_id = ? and status = ? order by data_criacao desc",
    "select count(*) as total from checklists where setor_id = ? and status = ?",
    [setorId, status],
    pagina,
    porPagina
  );
}

export function respostasDoChecklist(checklistId: string) {
  return conectar()
    .prepare("select * from checklist_respostas where checklist_id = ?")
    .all(checklistId) as ChecklistResposta[];
}

export function salvarResposta(entrada: {
  checklistId: string;
  itemId: string;
  auditorId: string;
  conforme: boolean;
  observacao?: string | null;
  fotoUrl?: string | null;
}) {
  const existente = conectar()
    .prepare(
      "select id from checklist_respostas where checklist_id = ? and item_id = ?"
    )
    .get(entrada.checklistId, entrada.itemId) as { id: string } | undefined;

  const observacao = entrada.conforme ? null : (entrada.observacao ?? "").trim();
  const fotoUrl = entrada.conforme ? null : entrada.fotoUrl ?? null;

  if (!entrada.conforme && (!observacao || !fotoUrl))
    return "Não conformidade exige descrição e foto.";

  if (existente) {
    conectar().prepare(
      "update checklist_respostas set conforme = ?, observacao = ?, foto_url = ? where id = ?"
    ).run(entrada.conforme ? 1 : 0, observacao, fotoUrl, existente.id);
  } else {
    conectar().prepare(
      `insert into checklist_respostas (id, checklist_id, item_id, conforme, observacao, foto_url, criado_em)
       values (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      novoId(),
      entrada.checklistId,
      entrada.itemId,
      entrada.conforme ? 1 : 0,
      observacao,
      fotoUrl,
      agora()
    );
  }

  conectar()
    .prepare("update checklists set preenchido_por = ? where id = ?")
    .run(entrada.auditorId, entrada.checklistId);

  return null;
}

export function finalizarChecklist(checklistId: string, auditorId: string) {
  const checklist = obterChecklist(checklistId);
  if (!checklist) return "Checklist inválido.";
  if (checklist.status === "finalizado") return "Checklist já finalizado.";

  const itens = listarItens(checklist.template_id);
  const respostas = respostasDoChecklist(checklistId);

  if (itens.length === 0) return "Template sem itens.";
  if (respostas.length < itens.length)
    return "Responda todos os itens antes de finalizar.";

  const db = conectar();
  db.exec("begin");
  try {
    db.prepare(
      "update checklists set status = 'finalizado', finalizado_em = ?, preenchido_por = ? where id = ?"
    ).run(agora(), auditorId, checklistId);

    const naoConformes = respostas.filter((resposta) => !resposta.conforme);
    for (const resposta of naoConformes) {
      db.prepare(
        `insert into acoes (id, codigo, resposta_id, setor_id, descricao_problema, foto_url, aberto_por, aberto_em, status, reset_count)
         values (?, ?, ?, ?, ?, ?, ?, ?, 'aberta', 0)`
      ).run(
        novoId(),
        proximoCodigo("ACA"),
        resposta.id,
        checklist.setor_id,
        resposta.observacao,
        resposta.foto_url,
        auditorId,
        agora()
      );
    }
    db.exec("commit");
  } catch (erro) {
    db.exec("rollback");
    throw erro;
  }

  return null;
}

/* acoes */

export function aplicarVencimentos() {
  conectar().prepare(
    "update acoes set status = 'vencida' where status = 'com_prazo' and prazo < ?"
  ).run(hoje());
}

export function listarAcoesDoSetor(setorId: string, pagina = 1) {
  aplicarVencimentos();
  return consultarPagina<Acao>(
    "select * from acoes where setor_id = ? order by case status when 'aberta' then 0 when 'vencida' then 1 when 'com_prazo' then 2 else 3 end, aberto_em desc",
    "select count(*) as total from acoes where setor_id = ?",
    [setorId],
    pagina
  );
}

export function listarAcoesVencidas(setorId: string, pagina = 1) {
  aplicarVencimentos();
  return consultarPagina<Acao>(
    "select * from acoes where setor_id = ? and status = 'vencida' order by prazo",
    "select count(*) as total from acoes where setor_id = ? and status = 'vencida'",
    [setorId],
    pagina
  );
}

export function contarAcoesVencidas(setorId: string) {
  aplicarVencimentos();
  const linha = conectar()
    .prepare(
      "select count(*) as total from acoes where setor_id = ? and status = 'vencida'"
    )
    .get<{ total: number }>(setorId);
  return linha?.total ?? 0;
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

export function resumoAcoesPorSetor(
  setorId: string | null | undefined,
  pagina = 1,
  porPagina = 10
) {
  aplicarVencimentos();
  const filtro = setorId ? "where setor_id = ?" : "";
  const parametros = setorId ? [setorId] : [];

  return consultarPagina<ResumoSetor>(
    `select setor_id,
            sum(case when status = 'aberta' then 1 else 0 end) as aberta,
            sum(case when status = 'com_prazo' then 1 else 0 end) as com_prazo,
            sum(case when status = 'vencida' then 1 else 0 end) as vencida,
            sum(case when status = 'concluida' then 1 else 0 end) as concluida,
            count(*) as total
     from acoes ${filtro}
     group by setor_id
     order by total desc`,
    `select count(*) as total from (select setor_id from acoes ${filtro} group by setor_id)`,
    parametros,
    pagina,
    porPagina
  );
}

export function indicadoresAcoes(setorId?: string | null) {
  aplicarVencimentos();
  const filtro = setorId ? "where setor_id = ?" : "";
  const parametros = setorId ? [setorId] : [];

  const linha = conectar()
    .prepare(
      `select
         count(*) as total,
         sum(case when status = 'aberta' then 1 else 0 end) as abertas,
         sum(case when status = 'com_prazo' then 1 else 0 end) as com_prazo,
         sum(case when status = 'concluida' then 1 else 0 end) as concluidas,
         sum(case when status = 'vencida' then 1 else 0 end) as vencidas,
         sum(case when reset_count > 0 then 1 else 0 end) as reincidentes,
         avg(
           case when status = 'concluida' and concluido_em is not null
             then julianday(concluido_em) - julianday(aberto_em)
           end
         ) as media_dias
       from acoes ${filtro}`
    )
    .get<{
      total: number;
      abertas: number | null;
      com_prazo: number | null;
      concluidas: number | null;
      vencidas: number | null;
      reincidentes: number | null;
      media_dias: number | null;
    }>(...parametros);

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
    ? "where status = 'concluida' and concluido_em is not null and setor_id = ?"
    : "where status = 'concluida' and concluido_em is not null";
  const parametros = setorId ? [setorId] : [];

  return consultarPagina<{
    setor_id: string;
    total: number;
    media_dias: number | null;
  }>(
    `select setor_id, count(*) as total,
            avg(julianday(concluido_em) - julianday(aberto_em)) as media_dias
     from acoes ${filtro}
     group by setor_id
     order by media_dias desc`,
    `select count(*) as total from (select setor_id from acoes ${filtro} group by setor_id)`,
    parametros,
    pagina,
    porPagina
  );
}

export function listarAcoesPorStatus(
  status: StatusAcao,
  setorId: string | null | undefined,
  pagina = 1
) {
  aplicarVencimentos();
  const filtro = setorId ? "status = ? and setor_id = ?" : "status = ?";
  const parametros = setorId ? [status, setorId] : [status];

  return consultarPagina<Acao>(
    `select * from acoes where ${filtro} order by prazo`,
    `select count(*) as total from acoes where ${filtro}`,
    parametros,
    pagina
  );
}

export function listarAcoesReincidentes(
  setorId: string | null | undefined,
  pagina = 1
) {
  const filtro = setorId ? "reset_count > 0 and setor_id = ?" : "reset_count > 0";
  const parametros = setorId ? [setorId] : [];

  return consultarPagina<Acao>(
    `select * from acoes where ${filtro} order by reset_count desc, aberto_em desc`,
    `select count(*) as total from acoes where ${filtro}`,
    parametros,
    pagina
  );
}

export function obterAcao(id: string) {
  return conectar().prepare("select * from acoes where id = ?").get(id) as
    | Acao
    | undefined;
}

export function definirPrazo(id: string, prazo: string, setorId: string) {
  const acao = obterAcao(id);
  if (!acao || acao.setor_id !== setorId) return "Ação fora do seu setor.";
  if (acao.status !== "aberta") return "Prazo só pode ser definido em ação aberta.";

  conectar().prepare("update acoes set prazo = ?, status = 'com_prazo' where id = ?").run(
    prazo,
    id
  );
  aplicarVencimentos();
  return null;
}

export function concluirAcao(id: string, auditor: AppUser) {
  const acao = obterAcao(id);
  if (!acao || acao.setor_id !== auditor.setor_id)
    return "Ação fora do seu setor.";
  if (acao.status !== "vencida") return "Apenas ações vencidas são avaliadas.";

  conectar().prepare(
    "update acoes set status = 'concluida', concluido_em = ?, concluido_por = ? where id = ?"
  ).run(agora(), auditor.id, id);
  return null;
}

export function resetarAcao(id: string, auditor: AppUser) {
  const acao = obterAcao(id);
  if (!acao || acao.setor_id !== auditor.setor_id)
    return "Ação fora do seu setor.";
  if (acao.status !== "vencida") return "Apenas ações vencidas são avaliadas.";

  conectar().prepare(
    "update acoes set status = 'aberta', prazo = null, reset_count = reset_count + 1 where id = ?"
  ).run(id);
  return null;
}
