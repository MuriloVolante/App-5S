"use server";

import { redirect } from "next/navigation";
import { requirePapel } from "@/lib/auth";
import * as repo from "@/lib/repo";
import type { EstadoAcao } from "@/lib/actions";

export async function abrirChecklist(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const usuario = await requirePapel(["auditor"]);
  const templateId = String(formData.get("template_id") ?? "");
  if (!templateId) return { erro: "Checklist inválido." };

  const template = repo.obterTemplate(templateId);
  if (!template) return { erro: "Checklist inválido." };
  if (repo.contarItens(template.id) === 0)
    return { erro: "Checklist sem itens cadastrados pelo embaixador." };

  const id = repo.criarChecklist(template.id, template.setor_id, usuario.id);
  redirect(`/auditor/checklists/${id}`);
}
