import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { gerarHash } from "@/lib/senha";

const ARQUIVO =
  process.env.DATABASE_FILE ?? path.join(process.cwd(), "data", "app.db");

declare global {
  var __db: DatabaseSync | undefined;
}

function abrir() {
  fs.mkdirSync(path.dirname(ARQUIVO), { recursive: true });
  const db = new DatabaseSync(ARQUIVO);
  db.exec("pragma journal_mode = WAL");
  db.exec("pragma foreign_keys = ON");
  criarSchema(db);
  migrarPapeis(db);
  semearDemo(db);
  return db;
}

function criarSchema(db: DatabaseSync) {
  db.exec(`
    create table if not exists sequencias (
      nome text primary key,
      valor integer not null default 0
    );

    create table if not exists setores (
      id text primary key,
      codigo text unique not null,
      nome text not null,
      criado_em text not null
    );

    create table if not exists users (
      id text primary key,
      codigo text unique not null,
      nome text not null,
      email text unique not null,
      senha_hash text not null,
      papel text,
      setor_id text references setores (id),
      criado_em text not null
    );

    create table if not exists checklist_templates (
      id text primary key,
      codigo text unique not null,
      setor_id text not null references setores (id),
      nome text not null,
      criado_em text not null
    );

    create table if not exists checklist_items (
      id text primary key,
      codigo text unique not null,
      template_id text not null references checklist_templates (id) on delete cascade,
      descricao text not null,
      ordem integer not null default 1,
      criado_em text not null
    );

    create table if not exists checklists (
      id text primary key,
      codigo text unique not null,
      setor_id text not null references setores (id),
      criado_por text not null references users (id),
      preenchido_por text references users (id),
      template_id text not null references checklist_templates (id),
      data_criacao text not null,
      status text not null default 'aberto',
      finalizado_em text
    );

    create table if not exists checklist_respostas (
      id text primary key,
      checklist_id text not null references checklists (id) on delete cascade,
      item_id text not null references checklist_items (id),
      conforme integer not null,
      observacao text,
      foto_url text,
      criado_em text not null,
      unique (checklist_id, item_id)
    );

    create table if not exists acoes (
      id text primary key,
      codigo text unique not null,
      resposta_id text not null unique references checklist_respostas (id) on delete cascade,
      setor_id text not null references setores (id),
      descricao_problema text not null,
      foto_url text not null,
      aberto_por text not null references users (id),
      aberto_em text not null,
      prazo text,
      status text not null default 'aberta',
      reset_count integer not null default 0,
      concluido_em text,
      concluido_por text references users (id)
    );

    create table if not exists sessoes (
      id text primary key,
      user_id text not null references users (id) on delete cascade,
      criado_em text not null
    );

    create index if not exists users_setor_idx on users (setor_id);
    create index if not exists templates_setor_idx on checklist_templates (setor_id, codigo);
    create index if not exists itens_template_idx on checklist_items (template_id, ordem);
    create index if not exists checklists_setor_idx on checklists (setor_id, status, data_criacao);
    create index if not exists respostas_checklist_idx on checklist_respostas (checklist_id);
    create index if not exists acoes_setor_idx on acoes (setor_id, status, aberto_em);
    create index if not exists acoes_prazo_idx on acoes (status, prazo);
    create index if not exists acoes_reset_idx on acoes (reset_count);
    create index if not exists sessoes_user_idx on sessoes (user_id);
  `);
}

// Bases criadas antes da renomeacao de papeis (lider/coordenador) continuam validas.
function migrarPapeis(db: DatabaseSync) {
  const colunas = db
    .prepare("pragma table_info(checklists)")
    .all() as { name: string }[];
  const nomes = colunas.map((coluna) => coluna.name);

  if (nomes.includes("lider_id")) {
    db.exec("alter table checklists rename column lider_id to criado_por");
  }
  if (!nomes.includes("preenchido_por")) {
    db.exec("alter table checklists add column preenchido_por text");
    db.exec("update checklists set preenchido_por = criado_por");
  }

  db.exec("update users set papel = 'auditor' where papel = 'lider'");
  db.exec("update users set papel = 'embaixador' where papel = 'coordenador'");
}

function semearDemo(db: DatabaseSync) {
  if (process.env.SEM_DEMO === "1") return;

  const { total } = db.prepare("select count(*) as total from users").get() as {
    total: number;
  };
  if (total > 0) return;

  const momento = new Date().toISOString();
  const sequencia = new Map<string, number>();

  const codigo = (prefixo: string) => {
    const valor = (sequencia.get(prefixo) ?? 0) + 1;
    sequencia.set(prefixo, valor);
    db.prepare(
      "insert into sequencias (nome, valor) values (?, ?) on conflict (nome) do update set valor = excluded.valor"
    ).run(prefixo, valor);
    return `${prefixo}-${String(valor).padStart(4, "0")}`;
  };

  const inserirSetor = (nome: string) => {
    const id = crypto.randomUUID();
    db.prepare(
      "insert into setores (id, codigo, nome, criado_em) values (?, ?, ?, ?)"
    ).run(id, codigo("SET"), nome, momento);
    return id;
  };

  const inserirUsuario = (
    nome: string,
    email: string,
    papel: string | null,
    setorId: string | null
  ) => {
    const id = crypto.randomUUID();
    db.prepare(
      `insert into users (id, codigo, nome, email, senha_hash, papel, setor_id, criado_em)
       values (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      codigo("USR"),
      nome,
      email,
      gerarHash("123456"),
      papel,
      setorId,
      momento
    );
    return id;
  };

  const inserirTemplate = (nome: string, setorId: string, itens: string[]) => {
    const templateId = crypto.randomUUID();
    db.prepare(
      "insert into checklist_templates (id, codigo, setor_id, nome, criado_em) values (?, ?, ?, ?, ?)"
    ).run(templateId, codigo("TPL"), setorId, nome, momento);

    itens.forEach((descricao, indice) => {
      db.prepare(
        "insert into checklist_items (id, codigo, template_id, descricao, ordem, criado_em) values (?, ?, ?, ?, ?, ?)"
      ).run(
        crypto.randomUUID(),
        codigo("ITM"),
        templateId,
        descricao,
        indice + 1,
        momento
      );
    });

    return templateId;
  };

  const producao = inserirSetor("Produção");
  const manutencao = inserirSetor("Manutenção");

  inserirUsuario("Admin Demo", "admin@demo.local", "admin", null);
  inserirUsuario("Auditor Produção", "lider@demo.local", "auditor", producao);
  const embaixadorProducao = inserirUsuario(
    "Embaixador Produção",
    "coord@demo.local",
    "embaixador",
    producao
  );
  inserirUsuario("Auditor Manutenção", "lider2@demo.local", "auditor", manutencao);
  inserirUsuario(
    "Embaixador Manutenção",
    "coord2@demo.local",
    "embaixador",
    manutencao
  );

  const inspecaoProducao = inserirTemplate("Inspeção diária de segurança", producao, [
    "Extintores desobstruídos e no prazo",
    "Rotas de fuga livres",
    "EPIs em uso pela equipe",
    "Piso limpo e sem vazamentos",
    "Ferramentas guardadas após o uso",
  ]);

  inserirTemplate("Checklist 5S da área", producao, [
    "Bancadas sem itens desnecessários",
    "Identificação visual dos armários",
    "Lixeiras segregadas corretamente",
  ]);

  inserirTemplate("Inspeção de manutenção preventiva", manutencao, [
    "Lubrificação das máquinas registrada",
    "Painéis elétricos fechados",
    "Ordens de serviço do dia atualizadas",
  ]);

  // checklist ja aberto pelo embaixador, pronto para o auditor preencher
  db.prepare(
    `insert into checklists (id, codigo, setor_id, criado_por, preenchido_por, template_id, data_criacao, status)
     values (?, ?, ?, ?, null, ?, ?, 'aberto')`
  ).run(
    crypto.randomUUID(),
    codigo("CHK"),
    producao,
    embaixadorProducao,
    inspecaoProducao,
    momento
  );

  console.log(
    "\n[demo] Banco criado com dados de exemplo. Senha de todos: 123456\n" +
      "[demo] admin@demo.local · lider@demo.local · coord@demo.local\n"
  );
}

type Parametro = string | number | bigint | null | Uint8Array;
type ParametrosNomeados = Record<string, Parametro>;
type Parametros = Parametro[] | [ParametrosNomeados];

// node:sqlite devolve linhas com prototipo nulo; o React nao serializa esses
// objetos para Client Components, entao cada linha e copiada para objeto comum.
function copiar<T>(linha: unknown): T {
  return { ...(linha as object) } as T;
}

function envolver(db: DatabaseSync) {
  return {
    exec: (sql: string) => db.exec(sql),
    prepare: (sql: string) => {
      const declaracao = db.prepare(sql);
      return {
        get: <T>(...parametros: Parametros): T | undefined => {
          const linha = declaracao.get(...(parametros as Parametro[]));
          return linha === undefined ? undefined : copiar<T>(linha);
        },
        all: <T>(...parametros: Parametros): T[] =>
          declaracao
            .all(...(parametros as Parametro[]))
            .map((linha) => copiar<T>(linha)),
        run: (...parametros: Parametros) =>
          declaracao.run(...(parametros as Parametro[])),
      };
    },
  };
}

export function conectar() {
  if (!globalThis.__db) globalThis.__db = abrir();
  return envolver(globalThis.__db);
}

export function agora() {
  return new Date().toISOString();
}

export function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function novoId() {
  return crypto.randomUUID();
}

export function proximoCodigo(prefixo: string) {
  const db = conectar();
  const atual = db
    .prepare("select valor from sequencias where nome = ?")
    .get(prefixo) as { valor: number } | undefined;

  const valor = (atual?.valor ?? 0) + 1;
  db.prepare(
    "insert into sequencias (nome, valor) values (?, ?) on conflict (nome) do update set valor = excluded.valor"
  ).run(prefixo, valor);

  return `${prefixo}-${String(valor).padStart(4, "0")}`;
}
