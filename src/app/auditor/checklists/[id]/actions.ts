"use server";

import { revalidatePath } from "next/cache";
import { requirePapel } from "@/lib/auth";
import { salvarFoto } from "@/lib/fotos";
import * as repo from "@/lib/repo";
import type { EstadoAcao } from "@/lib/actions";
import type { Checklist } from "@/types";

type Contexto =
  | { ok: false; bloqueio: string }
  | { ok: true; checklist: Checklist; auditorId: string };

async function checklistEditavel(checklistId: string): Promise<Contexto> {
  const usuario = await requirePapel(["auditor"]);
  const checklist = repo.obterChecklist(checklistId);

  if (!checklist || checklist.setor_id !== usuario.setor_id)
    return { ok: false, bloqueio: "Checklist fora do seu setor." };
  if (checklist.status !== "aberto")
    return { ok: false, bloqueio: "Checklist já finalizado." };

  return { ok: true, checklist, auditorId: usuario.id };
}

export async function marcarConforme(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const checklistId = String(formData.get("checklist_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  if (!checklistId || !itemId) return { erro: "Resposta inválida." };

  const contexto = await checklistEditavel(checklistId);
  if (!contexto.ok) return { erro: contexto.bloqueio };

  const erro = repo.salvarResposta({
    checklistId,
    itemId,
    auditorId: contexto.auditorId,
    conforme: true,
  });
  if (erro) return { erro };

  revalidatePath(`/auditor/checklists/${checklistId}`);
  return { erro: null, ok: true };
}

export async function registrarNaoConforme(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const checklistId = String(formData.get("checklist_id") ?? "");
  const itemId = String(formData.get("item_id") ?? "");
  const observacao = String(formData.get("observacao") ?? "").trim();
  const foto = formData.get("foto");

  if (!checklistId || !itemId) return { erro: "Resposta inválida." };
  if (!observacao) return { erro: "Descreva o problema." };
  if (!(foto instanceof File) || foto.size === 0)
    return { erro: "Anexe a foto da não conformidade." };
  if (!foto.type.startsWith("image/"))
    return { erro: "O anexo precisa ser uma imagem." };

  const contexto = await checklistEditavel(checklistId);
  if (!contexto.ok) return { erro: contexto.bloqueio };

  const fotoUrl = await salvarFoto(foto, checklistId);
  const erro = repo.salvarResposta({
    checklistId,
    itemId,
    auditorId: contexto.auditorId,
    conforme: false,
    observacao,
    fotoUrl,
  });
  if (erro) return { erro };

  revalidatePath(`/auditor/checklists/${checklistId}`);
  return { erro: null, ok: true };
}

export async function finalizar(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const checklistId = String(formData.get("checklist_id") ?? "");
  if (!checklistId) return { erro: "Checklist inválido." };

  const contexto = await checklistEditavel(checklistId);
  if (!contexto.ok) return { erro: contexto.bloqueio };

  const erro = repo.finalizarChecklist(checklistId, contexto.auditorId);
  if (erro) return { erro };

  revalidatePath(`/auditor/checklists/${checklistId}`);
  revalidatePath("/auditor");
  revalidatePath("/embaixador");
  return { erro: null, ok: true };
}
