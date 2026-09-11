"use server";

import { revalidatePath } from "next/cache";
import { requirePapel } from "@/lib/auth";
import * as repo from "@/lib/repo";
import type { EstadoAcao } from "@/lib/actions";
import type { Papel } from "@/types";

const PAPEIS: Papel[] = ["lider", "coordenador", "admin"];

function lerPapelSetor(formData: FormData) {
  const bruto = String(formData.get("papel") ?? "");
  const setorId = String(formData.get("setor_id") ?? "");

  if (bruto && !PAPEIS.includes(bruto as Papel)) return "Papel invalido.";

  const papel = (bruto || null) as Papel | null;
  if (papel && papel !== "admin" && !setorId) return "Selecione o setor.";

  return { papel, setorId: papel && papel !== "admin" ? setorId : null };
}

export async function criarUsuario(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  await requirePapel(["admin"]);

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  if (!nome) return { erro: "Informe o nome." };
  if (!email) return { erro: "Informe o email." };
  if (senha.length < 6) return { erro: "Senha deve ter ao menos 6 caracteres." };

  const vinculo = lerPapelSetor(formData);
  if (typeof vinculo === "string") return { erro: vinculo };

  const resultado = repo.criarUsuario({ nome, email, senha, ...vinculo });
  if (resultado === "Email ja cadastrado.") return { erro: resultado };

  revalidatePath("/admin/usuarios");
  return { erro: null, ok: true };
}

export async function atualizarUsuario(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  await requirePapel(["admin"]);

  const id = String(formData.get("id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  if (!id) return { erro: "Usuario invalido." };
  if (!nome) return { erro: "Informe o nome." };

  const vinculo = lerPapelSetor(formData);
  if (typeof vinculo === "string") return { erro: vinculo };

  repo.atualizarUsuario(id, { nome, ...vinculo });
  revalidatePath("/admin/usuarios");
  return { erro: null, ok: true };
}

export async function excluirUsuario(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const admin = await requirePapel(["admin"]);
  const id = String(formData.get("id") ?? "");
  if (!id) return { erro: "Usuario invalido." };
  if (id === admin.id) return { erro: "Nao e possivel excluir a si mesmo." };

  const erro = repo.excluirUsuario(id);
  if (erro) return { erro };

  revalidatePath("/admin/usuarios");
  return { erro: null, ok: true };
}
