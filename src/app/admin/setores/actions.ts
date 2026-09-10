"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EstadoAcao } from "@/lib/actions";

function nomeDoForm(formData: FormData) {
  return String(formData.get("nome") ?? "").trim();
}

export async function criarSetor(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const nome = nomeDoForm(formData);
  if (!nome) return { erro: "Informe o nome do setor." };

  const supabase = await createClient();
  const { error } = await supabase.from("setores").insert({ nome });
  if (error) return { erro: error.message };

  revalidatePath("/admin/setores");
  return { erro: null, ok: true };
}

export async function atualizarSetor(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const id = String(formData.get("id") ?? "");
  const nome = nomeDoForm(formData);
  if (!id) return { erro: "Setor invalido." };
  if (!nome) return { erro: "Informe o nome do setor." };

  const supabase = await createClient();
  const { error } = await supabase.from("setores").update({ nome }).eq("id", id);
  if (error) return { erro: error.message };

  revalidatePath("/admin/setores");
  return { erro: null, ok: true };
}

export async function excluirSetor(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { erro: "Setor invalido." };

  const supabase = await createClient();
  const { error } = await supabase.from("setores").delete().eq("id", id);
  if (error) {
    if (error.code === "23503")
      return { erro: "Setor possui usuarios vinculados." };
    return { erro: error.message };
  }

  revalidatePath("/admin/setores");
  return { erro: null, ok: true };
}
