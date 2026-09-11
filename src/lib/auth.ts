import { redirect } from "next/navigation";
import { usuarioDaSessao } from "@/lib/sessao";
import { HOME_POR_PAPEL, type AppUser, type Papel } from "@/types";

export async function getUsuarioAtual() {
  return usuarioDaSessao();
}

export async function requireUsuario(): Promise<AppUser> {
  const usuario = await usuarioDaSessao();
  if (!usuario) redirect("/login");
  return usuario;
}

export async function requirePapel(papeis: Papel[]): Promise<AppUser> {
  const usuario = await requireUsuario();
  if (!usuario.papel) redirect("/pendente");
  if (!papeis.includes(usuario.papel)) redirect(HOME_POR_PAPEL[usuario.papel]);
  return usuario;
}
