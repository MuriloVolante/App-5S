"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePapel } from "@/lib/auth";
import type { EstadoAcao } from "@/lib/actions";

export async function criarChecklist(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const templateId = String(formData.get("template_id") ?? "");
  if (!templateId) return { erro: "Template invalido." };

  const usuario = await requirePapel(["lider"]);
  const supabase = await createClient();

  const { data: template } = await supabase
    .from("checklist_templates")
    .select("id, setor_id")
    .eq("id", templateId)
    .single();

  if (!template || template.setor_id !== usuario.setor_id)
    return { erro: "Template fora do seu setor." };

  const { data, error } = await supabase
    .from("checklists")
    .insert({
      template_id: template.id,
      setor_id: template.setor_id,
      lider_id: usuario.id,
    })
    .select("id")
    .single();

  if (error || !data) return { erro: error?.message ?? "Falha ao criar." };

  redirect(`/lider/checklists/${data.id}`);
}
