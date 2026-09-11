"use server";

import { revalidatePath } from "next/cache";
import { requirePapel } from "@/lib/auth";
import * as repo from "@/lib/repo";
import type { EstadoAcao } from "@/lib/actions";

export async function definirPrazo(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const usuario = await requirePapel(["coordenador"]);
  const id = String(formData.get("id") ?? "");
  const prazo = String(formData.get("prazo") ?? "");

  if (!id) return { erro: "Ação inválida." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(prazo)) return { erro: "Informe o prazo." };

  const erro = repo.definirPrazo(id, prazo, usuario.setor_id!);
  if (erro) return { erro };

  revalidatePath("/coordenador");
  return { erro: null, ok: true };
}
