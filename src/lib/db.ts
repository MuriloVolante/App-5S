import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { gerarHash } from "@/lib/senha";

const ARQUIVO =
  process.env.DATABASE_FILE ?? path.join(process.cwd(), "data", "app.db");

declare global {
  var __db: Database.Database | undefined;
}

function abrir() {
  fs.mkdirSync(path.dirname(ARQUIVO), { recursive: true });
  const db = new Database(ARQUIVO);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  criarSchema(db);
  semearDemo(db);
  return db;
}

function criarSchema(db: Database.Database) {
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
      lider_id text not null references users (id),
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
  `);
}

function semearDemo(db: Database.Database) {
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
    db.prepare(
      `insert into users (id, codigo, nome, email, senha_hash, papel, setor_id, criado_em)
       values (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      crypto.randomUUID(),
      codigo("USR"),
      nome,
      email,
      gerarHash("123456"),
      papel,
      setorId,
      momento
    );
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
  };

  const producao = inserirSetor("Producao");
  const manutencao = inserirSetor("Manutencao");

  inserirUsuario("Admin Demo", "admin@demo.local", "admin", null);
  inserirUsuario("Lider Producao", "lider@demo.local", "lider", producao);
  inserirUsuario("Coord Producao", "coord@demo.local", "coordenador", producao);
  inserirUsuario("Lider Manutencao", "lider2@demo.local", "lider", manutencao);
  inserirUsuario(
    "Coord Manutencao",
    "coord2@demo.local",
    "coordenador",
    manutencao
  );

  inserirTemplate("Inspecao diaria de seguranca", producao, [
    "Extintores desobstruidos e no prazo",
    "Rotas de fuga livres",
    "EPIs em uso pela equipe",
    "Piso limpo e sem vazamentos",
    "Ferramentas guardadas apos o uso",
  ]);

  inserirTemplate("Checklist 5S da area", producao, [
    "Bancadas sem itens desnecessarios",
    "Identificacao visual dos armarios",
    "Lixeiras segregadas corretamente",
  ]);

  inserirTemplate("Inspecao de manutencao preventiva", manutencao, [
    "Lubrificacao das maquinas registrada",
    "Paineis eletricos fechados",
    "Ordens de servico do dia atualizadas",
  ]);

  console.log(
    "\n[demo] Banco criado com dados de exemplo. Senha de todos: 123456\n" +
      "[demo] admin@demo.local · lider@demo.local · coord@demo.local\n"
  );
}

export function conectar() {
  if (!globalThis.__db) globalThis.__db = abrir();
  return globalThis.__db;
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
