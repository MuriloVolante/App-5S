"use server";

import { revalidatePath } from "next/cache";
import { requirePapel } from "@/lib/auth";
import * as repo from "@/lib/repo";
import type { EstadoAcao } from "@/lib/actions";

// O embaixador so administra os templates do proprio setor.
async function templateDoSetor(templateId: string) {
  const usuario = await requirePapel(["embaixador"]);
  const template = repo.obterTemplate(templateId);

  if (!template || template.setor_id !== usuario.setor_id) return null;
  return template;
}

export async function criarTemplate(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const usuario = await requirePapel(["embaixador"]);
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { erro: "Informe o nome do checklist." };

  repo.criarTemplate(nome, usuario.setor_id!);
  revalidatePath("/embaixador/templates");
  return { erro: null, ok: true };
}

export async function atualizarTemplate(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const id = String(formData.get("id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  if (!id) return { erro: "Checklist inválido." };
  if (!nome) return { erro: "Informe o nome do checklist." };

  const template = await templateDoSetor(id);
  if (!template) return { erro: "Checklist fora do seu setor." };

  repo.atualizarTemplate(id, nome, template.setor_id);
  revalidatePath("/embaixador/templates");
  return { erro: null, ok: true };
}

export async function excluirTemplate(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { erro: "Checklist inválido." };

  const template = await templateDoSetor(id);
  if (!template) return { erro: "Checklist fora do seu setor." };

  const erro = repo.excluirTemplate(id);
  if (erro) return { erro };

  revalidatePath("/embaixador/templates");
  return { erro: null, ok: true };
}

export async function criarItem(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const templateId = String(formData.get("template_id") ?? "");
  const descricao = String(formData.get("descricao") ?? "").trim();
  const ordem = Number(formData.get("ordem") ?? 0) || 1;
  if (!templateId) return { erro: "Checklist inválido." };
  if (!descricao) return { erro: "Informe a descrição do item." };

  if (!(await templateDoSetor(templateId)))
    return { erro: "Checklist fora do seu setor." };

  repo.criarItem(templateId, descricao, ordem);
  revalidatePath(`/embaixador/templates/${templateId}`);
  return { erro: null, ok: true };
}

export async function atualizarItem(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const id = String(formData.get("id") ?? "");
  const templateId = String(formData.get("template_id") ?? "");
  const descricao = String(formData.get("descricao") ?? "").trim();
  const ordem = Number(formData.get("ordem") ?? 0) || 1;
  if (!id) return { erro: "Item inválido." };
  if (!descricao) return { erro: "Informe a descrição do item." };

  if (!(await templateDoSetor(templateId)))
    return { erro: "Checklist fora do seu setor." };

  repo.atualizarItem(id, descricao, ordem);
  revalidatePath(`/embaixador/templates/${templateId}`);
  return { erro: null, ok: true };
}

export async function excluirItem(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const id = String(formData.get("id") ?? "");
  const templateId = String(formData.get("template_id") ?? "");
  if (!id) return { erro: "Item inválido." };

  if (!(await templateDoSetor(templateId)))
    return { erro: "Checklist fora do seu setor." };

  const erro = repo.excluirItem(id);
  if (erro) return { erro };

  revalidatePath(`/embaixador/templates/${templateId}`);
  return { erro: null, ok: true };
}
