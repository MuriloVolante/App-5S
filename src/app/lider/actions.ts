"use server";

import { redirect } from "next/navigation";
import { requirePapel } from "@/lib/auth";
import * as repo from "@/lib/repo";
import type { EstadoAcao } from "@/lib/actions";

export async function criarChecklist(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const usuario = await requirePapel(["lider"]);
  const templateId = String(formData.get("template_id") ?? "");
  if (!templateId) return { erro: "Template invalido." };

  const template = repo.obterTemplate(templateId);
  if (!template || template.setor_id !== usuario.setor_id)
    return { erro: "Template fora do seu setor." };

  const id = repo.criarChecklist(template.id, template.setor_id, usuario.id);
  redirect(`/lider/checklists/${id}`);
}
