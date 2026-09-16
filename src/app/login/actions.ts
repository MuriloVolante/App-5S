"use server";

import { redirect } from "next/navigation";
import { buscarUsuarioPorEmail, contarUsuarios, criarUsuario } from "@/lib/repo";
import { conferirSenha } from "@/lib/senha";
import { criarSessao } from "@/lib/sessao";
import { HOME_POR_PAPEL } from "@/types";

export type EstadoLogin = { erro: string | null; aba: "entrar" | "criar" };

export async function entrar(
  _prev: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha)
    return { erro: "Informe e-mail e senha.", aba: "entrar" };

  const usuario = await buscarUsuarioPorEmail(email);
  if (!usuario || !conferirSenha(senha, usuario.senha_hash))
    return { erro: "E-mail ou senha inválidos.", aba: "entrar" };

  await criarSessao(usuario.id);
  redirect(usuario.papel ? HOME_POR_PAPEL[usuario.papel] : "/pendente");
}

export async function criarConta(
  _prev: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  if (!nome) return { erro: "Informe o nome.", aba: "criar" };
  if (!email) return { erro: "Informe o e-mail.", aba: "criar" };
  if (senha.length < 6)
    return { erro: "Senha deve ter ao menos 6 caracteres.", aba: "criar" };

  const primeiro = await contarUsuarios() === 0;
  const resultado = await criarUsuario({
    nome,
    email,
    senha,
    papel: primeiro ? "admin" : null,
    setorId: null,
  });

  if (resultado === "E-mail já cadastrado.")
    return { erro: resultado, aba: "criar" };

  await criarSessao(resultado);
  redirect(primeiro ? HOME_POR_PAPEL.admin : "/pendente");
}
