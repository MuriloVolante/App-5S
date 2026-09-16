import { cookies } from "next/headers";
import { consultar, consultarUm, executar } from "@/lib/db";
import type { AppUser } from "@/types";

const COOKIE = "vigia_sessao";

export async function criarSessao(userId: string) {
  const linha = await consultarUm<{ id: string }>(
    "insert into sessoes (user_id) values ($1) returning id",
    [userId]
  );

  const store = await cookies();
  store.set(COOKIE, linha!.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function encerrarSessao() {
  const store = await cookies();
  const id = store.get(COOKIE)?.value;
  if (id) await executar("delete from sessoes where id = $1", [id]);
  store.delete(COOKIE);
}

export async function usuarioDaSessao(): Promise<AppUser | null> {
  const store = await cookies();
  const id = store.get(COOKIE)?.value;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return null;

  const linhas = await consultar<AppUser>(
    `select u.id, u.codigo, u.nome, u.email, u.papel, u.setor_id, u.criado_em
     from sessoes s join users u on u.id = s.user_id
     where s.id = $1`,
    [id]
  );

  return linhas[0] ?? null;
}
