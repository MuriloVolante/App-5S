"use server";

import { revalidatePath } from "next/cache";
import { requirePapel } from "@/lib/auth";
import * as repo from "@/lib/repo";
import type { EstadoAcao } from "@/lib/actions";

export async function criarSetor(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  await requirePapel(["admin"]);
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { erro: "Informe o nome do setor." };

  repo.criarSetor(nome);
  revalidatePath("/admin/setores");
  return { erro: null, ok: true };
}

export async function atualizarSetor(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  await requirePapel(["admin"]);
  const id = String(formData.get("id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  if (!id) return { erro: "Setor invalido." };
  if (!nome) return { erro: "Informe o nome do setor." };

  repo.atualizarSetor(id, nome);
  revalidatePath("/admin/setores");
  return { erro: null, ok: true };
}

export async function excluirSetor(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  await requirePapel(["admin"]);
  const id = String(formData.get("id") ?? "");
  if (!id) return { erro: "Setor invalido." };

  const erro = repo.excluirSetor(id);
  if (erro) return { erro };

  revalidatePath("/admin/setores");
  return { erro: null, ok: true };
}
