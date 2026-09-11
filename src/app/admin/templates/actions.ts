"use server";

import { revalidatePath } from "next/cache";
import { requirePapel } from "@/lib/auth";
import * as repo from "@/lib/repo";
import type { EstadoAcao } from "@/lib/actions";

export async function criarTemplate(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  await requirePapel(["admin"]);
  const nome = String(formData.get("nome") ?? "").trim();
  const setorId = String(formData.get("setor_id") ?? "");
  if (!nome) return { erro: "Informe o nome do template." };
  if (!setorId) return { erro: "Selecione o setor." };

  repo.criarTemplate(nome, setorId);
  revalidatePath("/admin/templates");
  return { erro: null, ok: true };
}

export async function atualizarTemplate(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  await requirePapel(["admin"]);
  const id = String(formData.get("id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const setorId = String(formData.get("setor_id") ?? "");
  if (!id) return { erro: "Template inválido." };
  if (!nome) return { erro: "Informe o nome do template." };
  if (!setorId) return { erro: "Selecione o setor." };

  repo.atualizarTemplate(id, nome, setorId);
  revalidatePath("/admin/templates");
  return { erro: null, ok: true };
}

export async function excluirTemplate(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  await requirePapel(["admin"]);
  const id = String(formData.get("id") ?? "");
  if (!id) return { erro: "Template inválido." };

  const erro = repo.excluirTemplate(id);
  if (erro) return { erro };

  revalidatePath("/admin/templates");
  return { erro: null, ok: true };
}

export async function criarItem(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  await requirePapel(["admin"]);
  const templateId = String(formData.get("template_id") ?? "");
  const descricao = String(formData.get("descricao") ?? "").trim();
  const ordem = Number(formData.get("ordem") ?? 0) || 1;
  if (!templateId) return { erro: "Template inválido." };
  if (!descricao) return { erro: "Informe a descrição do item." };

  repo.criarItem(templateId, descricao, ordem);
  revalidatePath(`/admin/templates/${templateId}`);
  return { erro: null, ok: true };
}

export async function atualizarItem(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  await requirePapel(["admin"]);
  const id = String(formData.get("id") ?? "");
  const templateId = String(formData.get("template_id") ?? "");
  const descricao = String(formData.get("descricao") ?? "").trim();
  const ordem = Number(formData.get("ordem") ?? 0) || 1;
  if (!id) return { erro: "Item inválido." };
  if (!descricao) return { erro: "Informe a descrição do item." };

  repo.atualizarItem(id, descricao, ordem);
  revalidatePath(`/admin/templates/${templateId}`);
  return { erro: null, ok: true };
}

export async function excluirItem(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  await requirePapel(["admin"]);
  const id = String(formData.get("id") ?? "");
  const templateId = String(formData.get("template_id") ?? "");
  if (!id) return { erro: "Item inválido." };

  const erro = repo.excluirItem(id);
  if (erro) return { erro };

  revalidatePath(`/admin/templates/${templateId}`);
  return { erro: null, ok: true };
}
