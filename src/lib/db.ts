import { Pool, types } from "pg";
import { gerarHash } from "@/lib/senha";

// O app espera strings/numeros simples, como vinha do SQLite.
types.setTypeParser(20, (valor) => Number(valor)); // bigint (count)
types.setTypeParser(1700, (valor) => Number(valor)); // numeric (avg)
types.setTypeParser(1082, (valor) => valor); // date -> "YYYY-MM-DD"
types.setTypeParser(1184, (valor) => new Date(valor).toISOString()); // timestamptz

declare global {
  var __pool: Pool | undefined;
  var __schema: Promise<void> | undefined;
}

// O Supabase distribui os projetos entre clusters do pooler (aws-0 / aws-1) e o
// host correto nao vem pela API. Se o informado recusar o tenant, tentamos o outro.
function enderecos() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString)
    throw new Error(
      "DATABASE_URL nao configurada. Aponte para o Postgres do Supabase."
    );

  const alternativo = connectionString.includes("aws-0-")
    ? connectionString.replace("aws-0-", "aws-1-")
    : connectionString.includes("aws-1-")
      ? connectionString.replace("aws-1-", "aws-0-")
      : null;

  return alternativo ? [connectionString, alternativo] : [connectionString];
}

// O pg le sslmode/ssl da propria URL e, com "require", liga a verificacao da
// cadeia — que falha contra o pooler do Supabase ("self-signed certificate in
// certificate chain"). Removemos o parametro e definimos o TLS aqui.
function semSslmode(connectionString: string) {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete("sslmode");
    url.searchParams.delete("ssl");
    return url.toString();
  } catch {
    return connectionString;
  }
}

function criarPool(bruta: string) {
  const connectionString = semSslmode(bruta);
  const local =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

  return new Pool({
    connectionString,
    max: Number(process.env.DB_POOL_MAX ?? 3),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
    ssl: local ? undefined : { rejectUnauthorized: false },
  });
}

function pool() {
  if (!globalThis.__pool) globalThis.__pool = criarPool(enderecos()[0]);
  return globalThis.__pool;
}

export async function consultar<T = Record<string, unknown>>(
  sql: string,
  parametros: unknown[] = []
): Promise<T[]> {
  await prontidao();
  const { rows } = await pool().query(sql, parametros);
  return rows as T[];
}

export async function consultarUm<T = Record<string, unknown>>(
  sql: string,
  parametros: unknown[] = []
): Promise<T | undefined> {
  const linhas = await consultar<T>(sql, parametros);
  return linhas[0];
}

export async function executar(sql: string, parametros: unknown[] = []) {
  await prontidao();
  await pool().query(sql, parametros);
}

export async function emTransacao<T>(
  acao: (executarSql: (sql: string, parametros?: unknown[]) => Promise<void>) => Promise<T>
): Promise<T> {
  await prontidao();
  const cliente = await pool().connect();

  try {
    await cliente.query("begin");
    const resultado = await acao(async (sql, parametros = []) => {
      await cliente.query(sql, parametros);
    });
    await cliente.query("commit");
    return resultado;
  } catch (erro) {
    await cliente.query("rollback");
    throw erro;
  } finally {
    cliente.release();
  }
}

// O schema e criado uma unica vez por processo; em producao ja existe e o
// "if not exists" torna a chamada barata.
function prontidao() {
  if (!globalThis.__schema) globalThis.__schema = preparar();
  return globalThis.__schema;
}

async function preparar() {
  if (process.env.SEM_SCHEMA === "1") return;

  let ultimoErro: unknown;

  for (const endereco of enderecos()) {
    try {
      await globalThis.__pool?.end().catch(() => {});
      globalThis.__pool = criarPool(endereco);

      // Em producao o schema ja existe e o usuario da aplicacao nao tem (nem
      // precisa de) privilegio de DDL: basta confirmar que as tabelas estao la.
      const { rows } = await globalThis.__pool.query(
        "select to_regclass('public.users') is not null as existe"
      );
      if (rows[0]?.existe) return;

      await globalThis.__pool.query(SCHEMA);
      await semearDemo();
      return;
    } catch (erro) {
      ultimoErro = erro;
    }
  }

  globalThis.__schema = undefined;
  throw ultimoErro;
}

export const SCHEMA = `
create extension if not exists pgcrypto;

create sequence if not exists seq_setor;
create sequence if not exists seq_usuario;
create sequence if not exists seq_template;
create sequence if not exists seq_item;
create sequence if not exists seq_checklist;
create sequence if not exists seq_acao;

create table if not exists setores (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null default 'SET-' || lpad(nextval('seq_setor')::text, 4, '0'),
  nome text not null,
  criado_em timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null default 'USR-' || lpad(nextval('seq_usuario')::text, 4, '0'),
  nome text not null,
  email text unique not null,
  senha_hash text not null,
  papel text,
  setor_id uuid references setores (id),
  criado_em timestamptz not null default now()
);

create table if not exists checklist_templates (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null default 'TPL-' || lpad(nextval('seq_template')::text, 4, '0'),
  setor_id uuid not null references setores (id),
  nome text not null,
  criado_em timestamptz not null default now()
);

create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null default 'ITM-' || lpad(nextval('seq_item')::text, 4, '0'),
  template_id uuid not null references checklist_templates (id) on delete cascade,
  descricao text not null,
  ordem int not null default 1,
  criado_em timestamptz not null default now()
);

create table if not exists checklists (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null default 'CHK-' || lpad(nextval('seq_checklist')::text, 4, '0'),
  setor_id uuid not null references setores (id),
  criado_por uuid not null references users (id),
  preenchido_por uuid references users (id),
  template_id uuid not null references checklist_templates (id),
  data_criacao timestamptz not null default now(),
  status text not null default 'aberto',
  finalizado_em timestamptz
);

create table if not exists fotos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  conteudo bytea not null,
  criado_em timestamptz not null default now()
);

create table if not exists checklist_respostas (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references checklists (id) on delete cascade,
  item_id uuid not null references checklist_items (id),
  conforme boolean not null,
  observacao text,
  foto_url text,
  criado_em timestamptz not null default now(),
  unique (checklist_id, item_id)
);

create table if not exists acoes (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null default 'ACA-' || lpad(nextval('seq_acao')::text, 4, '0'),
  resposta_id uuid not null unique references checklist_respostas (id) on delete cascade,
  setor_id uuid not null references setores (id),
  descricao_problema text not null,
  foto_url text not null,
  aberto_por uuid not null references users (id),
  aberto_em timestamptz not null default now(),
  prazo date,
  status text not null default 'aberta',
  reset_count int not null default 0,
  concluido_em timestamptz,
  concluido_por uuid references users (id)
);

create table if not exists sessoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  criado_em timestamptz not null default now()
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
`;

async function semearDemo() {
  if (process.env.SEM_DEMO === "1") return;

  const { rows } = await pool().query("select count(*)::int as total from users");
  if (rows[0].total > 0) return;

  const senha = gerarHash("123456");

  const setores = await pool().query(
    `insert into setores (nome) values ('Produção'), ('Manutenção')
     returning id, nome`
  );
  const producao = setores.rows.find((linha) => linha.nome === "Produção").id;
  const manutencao = setores.rows.find(
    (linha) => linha.nome === "Manutenção"
  ).id;

  await pool().query(
    `insert into users (nome, email, senha_hash, papel, setor_id) values
       ('Admin Demo', 'admin@demo.local', $1, 'admin', null),
       ('Auditor Externo', 'lider@demo.local', $1, 'auditor', null),
       ('Auditora Externa', 'lider2@demo.local', $1, 'auditor', null),
       ('Embaixador Produção', 'coord@demo.local', $1, 'embaixador', $2),
       ('Embaixador Manutenção', 'coord2@demo.local', $1, 'embaixador', $3)`,
    [senha, producao, manutencao]
  );

  const modelos: [string, string, string[]][] = [
    [
      "Inspeção diária de segurança",
      producao,
      [
        "Extintores desobstruídos e no prazo",
        "Rotas de fuga livres",
        "EPIs em uso pela equipe",
        "Piso limpo e sem vazamentos",
        "Ferramentas guardadas após o uso",
      ],
    ],
    [
      "Checklist 5S da área",
      producao,
      [
        "Bancadas sem itens desnecessários",
        "Identificação visual dos armários",
        "Lixeiras segregadas corretamente",
      ],
    ],
    [
      "Inspeção de manutenção preventiva",
      manutencao,
      [
        "Lubrificação das máquinas registrada",
        "Painéis elétricos fechados",
        "Ordens de serviço do dia atualizadas",
      ],
    ],
  ];

  for (const [nome, setorId, itens] of modelos) {
    const template = await pool().query(
      "insert into checklist_templates (setor_id, nome) values ($1, $2) returning id",
      [setorId, nome]
    );

    for (const [indice, descricao] of itens.entries()) {
      await pool().query(
        "insert into checklist_items (template_id, descricao, ordem) values ($1, $2, $3)",
        [template.rows[0].id, descricao, indice + 1]
      );
    }
  }

  console.log(
    "\n[demo] Banco preparado com dados de exemplo. Senha de todos: 123456\n" +
      "[demo] admin@demo.local · lider@demo.local (auditor) · coord@demo.local (embaixador)\n"
  );
}

export function hoje() {
  return new Date().toISOString().slice(0, 10);
}
