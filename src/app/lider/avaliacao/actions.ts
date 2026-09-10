"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePapel } from "@/lib/auth";
import type { EstadoAcao } from "@/lib/actions";

async function avaliar(
  rpc: "concluir_acao" | "resetar_acao",
  formData: FormData
): Promise<EstadoAcao> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { erro: "Acao invalida." };

  await requirePapel(["lider"]);
  const supabase = await createClient();

  const { error } = await supabase.rpc(rpc, { acao_id: id });
  if (error) return { erro: error.message };

  revalidatePath("/lider/avaliacao");
  return { erro: null, ok: true };
}

export async function concluirAcao(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  return avaliar("concluir_acao", formData);
}

export async function resetarAcao(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  return avaliar("resetar_acao", formData);
}
