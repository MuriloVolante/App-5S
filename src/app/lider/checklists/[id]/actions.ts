"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePapel } from "@/lib/auth";

type Resultado = { erro: string | null };

type Contexto =
  | { ok: false; erro: string }
  | {
      ok: true;
      supabase: Awaited<ReturnType<typeof createClient>>;
      checklist: { id: string; template_id: string };
    };

async function checklistDoLider(checklistId: string): Promise<Contexto> {
  const usuario = await requirePapel(["lider"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("checklists")
    .select("id, lider_id, status, template_id")
    .eq("id", checklistId)
    .single();

  if (!data || data.lider_id !== usuario.id)
    return { ok: false, erro: "Checklist invalido." };
  if (data.status !== "aberto")
    return { ok: false, erro: "Checklist ja finalizado." };

  return { ok: true, supabase, checklist: data };
}

export async function salvarResposta(entrada: {
  checklistId: string;
  itemId: string;
  conforme: boolean;
  observacao?: string;
  fotoUrl?: string;
}): Promise<Resultado> {
  const { checklistId, itemId, conforme } = entrada;
  const observacao = (entrada.observacao ?? "").trim();
  const fotoUrl = (entrada.fotoUrl ?? "").trim();

  if (!checklistId || !itemId) return { erro: "Resposta invalida." };
  if (!conforme && (!observacao || !fotoUrl))
    return { erro: "Nao conformidade exige descricao e foto." };

  const ctx = await checklistDoLider(checklistId);
  if (!ctx.ok) return { erro: ctx.erro };

  const { error } = await ctx.supabase.from("checklist_respostas").upsert(
    {
      checklist_id: checklistId,
      item_id: itemId,
      conforme,
      observacao: conforme ? null : observacao,
      foto_url: conforme ? null : fotoUrl,
    },
    { onConflict: "checklist_id,item_id" }
  );

  if (error) return { erro: error.message };

  revalidatePath(`/lider/checklists/${checklistId}`);
  return { erro: null };
}

export async function finalizarChecklist(
  checklistId: string
): Promise<Resultado> {
  if (!checklistId) return { erro: "Checklist invalido." };

  const ctx = await checklistDoLider(checklistId);
  if (!ctx.ok) return { erro: ctx.erro };

  const [{ count: totalItens }, { count: totalRespostas }] = await Promise.all([
    ctx.supabase
      .from("checklist_items")
      .select("id", { count: "exact", head: true })
      .eq("template_id", ctx.checklist.template_id),
    ctx.supabase
      .from("checklist_respostas")
      .select("id", { count: "exact", head: true })
      .eq("checklist_id", checklistId),
  ]);

  if ((totalItens ?? 0) === 0) return { erro: "Template sem itens." };
  if ((totalRespostas ?? 0) < (totalItens ?? 0))
    return { erro: "Responda todos os itens antes de finalizar." };

  const { error } = await ctx.supabase
    .from("checklists")
    .update({ status: "finalizado", finalizado_em: new Date().toISOString() })
    .eq("id", checklistId);

  if (error) return { erro: error.message };

  revalidatePath(`/lider/checklists/${checklistId}`);
  revalidatePath("/lider");
  return { erro: null };
}
