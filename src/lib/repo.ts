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
} from "@/types";

/* setores */

export function listarSetores() {
  return conectar()
    .prepare("select * from setores order by codigo")
    .all() as Setor[];
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

  if (vinculos.usuarios > 0) return "Setor possui usuarios vinculados.";
  if (vinculos.templates > 0) return "Setor possui templates vinculados.";

  conectar().prepare("delete from setores where id = ?").run(id);
  return null;
}

/* usuarios */

export function listarUsuarios() {
  return conectar()
    .prepare(
      "select id, codigo, nome, email, papel, setor_id, criado_em from users order by codigo"
    )
    .all() as AppUser[];
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
  if (buscarUsuarioPorEmail(entrada.email)) return "Email ja cadastrado.";

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
         (select count(*) from checklists where lider_id = @id) as checklists,
         (select count(*) from acoes where aberto_por = @id or concluido_por = @id) as acoes`
    )
    .get({ id }) as { checklists: number; acoes: number };

  if (vinculos.checklists > 0 || vinculos.acoes > 0)
    return "Usuario possui checklists ou acoes vinculadas.";

  conectar().prepare("delete from users where id = ?").run(id);
  return null;
}

/* templates e itens */

export function listarTemplates() {
  return conectar()
    .prepare("select * from checklist_templates order by codigo")
    .all() as ChecklistTemplate[];
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

export function listarItens(templateId: string) {
  return conectar()
    .prepare(
      "select * from checklist_items where template_id = ? order by ordem, codigo"
    )
    .all(templateId) as ChecklistItem[];
}

export function contarItensPorTemplate() {
  const linhas = conectar()
    .prepare(
      "select template_id, count(*) as total from checklist_items group by template_id"
    )
    .all() as { template_id: string; total: number }[];

  return new Map(linhas.map((linha) => [linha.template_id, linha.total]));
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
  liderId: string
) {
  const id = novoId();
  conectar().prepare(
    `insert into checklists (id, codigo, setor_id, lider_id, template_id, data_criacao, status)
     values (?, ?, ?, ?, ?, ?, 'aberto')`
  ).run(id, proximoCodigo("CHK"), setorId, liderId, templateId, agora());

  return id;
}

export function obterChecklist(id: string) {
  return conectar().prepare("select * from checklists where id = ?").get(id) as
    | Checklist
    | undefined;
}

export function listarChecklistsDoLider(liderId: string) {
  return conectar()
    .prepare(
      "select * from checklists where lider_id = ? order by data_criacao desc limit 30"
    )
    .all(liderId) as Checklist[];
}

export function respostasDoChecklist(checklistId: string) {
  return conectar()
    .prepare("select * from checklist_respostas where checklist_id = ?")
    .all(checklistId) as ChecklistResposta[];
}

export function salvarResposta(entrada: {
  checklistId: string;
  itemId: string;
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
    return "Nao conformidade exige descricao e foto.";

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

  return null;
}

export function finalizarChecklist(checklistId: string) {
  const checklist = obterChecklist(checklistId);
  if (!checklist) return "Checklist invalido.";
  if (checklist.status === "finalizado") return "Checklist ja finalizado.";

  const itens = listarItens(checklist.template_id);
  const respostas = respostasDoChecklist(checklistId);

  if (itens.length === 0) return "Template sem itens.";
  if (respostas.length < itens.length)
    return "Responda todos os itens antes de finalizar.";

  const db = conectar();
  db.exec("begin");
  try {
    db.prepare(
      "update checklists set status = 'finalizado', finalizado_em = ? where id = ?"
    ).run(agora(), checklistId);

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
        checklist.lider_id,
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

export function listarAcoesDoSetor(setorId: string) {
  aplicarVencimentos();
  return conectar()
    .prepare("select * from acoes where setor_id = ? order by aberto_em desc")
    .all(setorId) as Acao[];
}

export function listarAcoesVencidas(setorId: string) {
  aplicarVencimentos();
  return conectar()
    .prepare(
      "select * from acoes where setor_id = ? and status = 'vencida' order by prazo"
    )
    .all(setorId) as Acao[];
}

export function listarAcoes(setorId?: string | null) {
  aplicarVencimentos();
  return setorId
    ? (conectar()
        .prepare("select * from acoes where setor_id = ? order by aberto_em desc")
        .all(setorId) as Acao[])
    : (conectar().prepare("select * from acoes order by aberto_em desc").all() as Acao[]);
}

export function obterAcao(id: string) {
  return conectar().prepare("select * from acoes where id = ?").get(id) as
    | Acao
    | undefined;
}

export function definirPrazo(id: string, prazo: string, setorId: string) {
  const acao = obterAcao(id);
  if (!acao || acao.setor_id !== setorId) return "Acao fora do seu setor.";
  if (acao.status !== "aberta") return "Prazo so pode ser definido em acao aberta.";

  conectar().prepare("update acoes set prazo = ?, status = 'com_prazo' where id = ?").run(
    prazo,
    id
  );
  aplicarVencimentos();
  return null;
}

export function concluirAcao(id: string, lider: AppUser) {
  const acao = obterAcao(id);
  if (!acao || acao.setor_id !== lider.setor_id) return "Acao fora do seu setor.";
  if (acao.status !== "vencida") return "Apenas acoes vencidas sao avaliadas.";

  conectar().prepare(
    "update acoes set status = 'concluida', concluido_em = ?, concluido_por = ? where id = ?"
  ).run(agora(), lider.id, id);
  return null;
}

export function resetarAcao(id: string, lider: AppUser) {
  const acao = obterAcao(id);
  if (!acao || acao.setor_id !== lider.setor_id) return "Acao fora do seu setor.";
  if (acao.status !== "vencida") return "Apenas acoes vencidas sao avaliadas.";

  conectar().prepare(
    "update acoes set status = 'aberta', prazo = null, reset_count = reset_count + 1 where id = ?"
  ).run(id);
  return null;
}
