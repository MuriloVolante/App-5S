"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EstadoAcao } from "@/lib/actions";

export async function criarTemplate(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const nome = String(formData.get("nome") ?? "").trim();
  const setorId = String(formData.get("setor_id") ?? "");
  if (!nome) return { erro: "Informe o nome do template." };
  if (!setorId) return { erro: "Selecione o setor." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_templates")
    .insert({ nome, setor_id: setorId });
  if (error) return { erro: error.message };

  revalidatePath("/admin/templates");
  return { erro: null, ok: true };
}

export async function atualizarTemplate(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const id = String(formData.get("id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const setorId = String(formData.get("setor_id") ?? "");
  if (!id) return { erro: "Template invalido." };
  if (!nome) return { erro: "Informe o nome do template." };
  if (!setorId) return { erro: "Selecione o setor." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_templates")
    .update({ nome, setor_id: setorId })
    .eq("id", id);
  if (error) return { erro: error.message };

  revalidatePath("/admin/templates");
  return { erro: null, ok: true };
}

export async function excluirTemplate(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { erro: "Template invalido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_templates")
    .delete()
    .eq("id", id);
  if (error) {
    if (error.code === "23503")
      return { erro: "Template possui checklists vinculados." };
    return { erro: error.message };
  }

  revalidatePath("/admin/templates");
  return { erro: null, ok: true };
}

export async function criarItem(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const templateId = String(formData.get("template_id") ?? "");
  const descricao = String(formData.get("descricao") ?? "").trim();
  const ordem = Number(formData.get("ordem") ?? 0);
  if (!templateId) return { erro: "Template invalido." };
  if (!descricao) return { erro: "Informe a descricao do item." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_items")
    .insert({ template_id: templateId, descricao, ordem: ordem || 1 });
  if (error) return { erro: error.message };

  revalidatePath(`/admin/templates/${templateId}`);
  return { erro: null, ok: true };
}

export async function atualizarItem(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const id = String(formData.get("id") ?? "");
  const templateId = String(formData.get("template_id") ?? "");
  const descricao = String(formData.get("descricao") ?? "").trim();
  const ordem = Number(formData.get("ordem") ?? 0);
  if (!id) return { erro: "Item invalido." };
  if (!descricao) return { erro: "Informe a descricao do item." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("checklist_items")
    .update({ descricao, ordem: ordem || 1 })
    .eq("id", id);
  if (error) return { erro: error.message };

  revalidatePath(`/admin/templates/${templateId}`);
  return { erro: null, ok: true };
}

export async function excluirItem(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const id = String(formData.get("id") ?? "");
  const templateId = String(formData.get("template_id") ?? "");
  if (!id) return { erro: "Item invalido." };

  const supabase = await createClient();
  const { error } = await supabase.from("checklist_items").delete().eq("id", id);
  if (error) {
    if (error.code === "23503")
      return { erro: "Item possui respostas registradas." };
    return { erro: error.message };
  }

  revalidatePath(`/admin/templates/${templateId}`);
  return { erro: null, ok: true };
}
