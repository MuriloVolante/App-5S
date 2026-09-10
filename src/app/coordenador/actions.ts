"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePapel } from "@/lib/auth";
import type { EstadoAcao } from "@/lib/actions";

export async function definirPrazo(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const id = String(formData.get("id") ?? "");
  const prazo = String(formData.get("prazo") ?? "");

  if (!id) return { erro: "Acao invalida." };
  if (!prazo) return { erro: "Informe o prazo." };

  await requirePapel(["coordenador"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("acoes")
    .update({ prazo, status: "com_prazo" })
    .eq("id", id)
    .eq("status", "aberta");

  if (error) return { erro: error.message };

  revalidatePath("/coordenador");
  return { erro: null, ok: true };
}
