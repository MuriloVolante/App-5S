import { cookies } from "next/headers";
import { conectar, agora, novoId } from "@/lib/db";
import type { AppUser } from "@/types";

const COOKIE = "vigia_sessao";

export async function criarSessao(userId: string) {
  const id = novoId();
  conectar().prepare(
    "insert into sessoes (id, user_id, criado_em) values (?, ?, ?)"
  ).run(id, userId, agora());

  const store = await cookies();
  store.set(COOKIE, id, {
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
  if (id) conectar().prepare("delete from sessoes where id = ?").run(id);
  store.delete(COOKIE);
}

export async function usuarioDaSessao(): Promise<AppUser | null> {
  const store = await cookies();
  const id = store.get(COOKIE)?.value;
  if (!id) return null;

  const usuario = conectar()
    .prepare(
      `select u.id, u.codigo, u.nome, u.email, u.papel, u.setor_id, u.criado_em
       from sessoes s join users u on u.id = s.user_id
       where s.id = ?`
    )
    .get(id) as AppUser | undefined;

  return usuario ?? null;
}
