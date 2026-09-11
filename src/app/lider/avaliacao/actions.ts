"use server";

import { revalidatePath } from "next/cache";
import { requirePapel } from "@/lib/auth";
import * as repo from "@/lib/repo";
import type { EstadoAcao } from "@/lib/actions";

export async function concluir(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const usuario = await requirePapel(["lider"]);
  const id = String(formData.get("id") ?? "");
  if (!id) return { erro: "Ação inválida." };

  const erro = repo.concluirAcao(id, usuario);
  if (erro) return { erro };

  revalidatePath("/lider/avaliacao");
  return { erro: null, ok: true };
}

export async function resetar(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const usuario = await requirePapel(["lider"]);
  const id = String(formData.get("id") ?? "");
  if (!id) return { erro: "Ação inválida." };

  const erro = repo.resetarAcao(id, usuario);
  if (erro) return { erro };

  revalidatePath("/lider/avaliacao");
  return { erro: null, ok: true };
}
