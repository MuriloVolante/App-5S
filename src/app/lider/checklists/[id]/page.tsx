import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requirePapel } from "@/lib/auth";
import Header from "@/components/header";
import type { Checklist, ChecklistItem, ChecklistResposta } from "@/types";
import Execucao from "./execucao";

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await requirePapel(["lider"]);
  const supabase = await createClient();

  const { data: checklist } = await supabase
    .from("checklists")
    .select(
      "id, codigo, setor_id, lider_id, template_id, data_criacao, status, finalizado_em, checklist_templates (codigo, nome)"
    )
    .eq("id", id)
    .single<Checklist & { checklist_templates: { codigo: string; nome: string } }>();

  if (!checklist) notFound();
  if (checklist.lider_id !== usuario.id) redirect("/lider");

  const [{ data: itensData }, { data: respostasData }] = await Promise.all([
    supabase
      .from("checklist_items")
      .select("id, codigo, template_id, descricao, ordem, created_at")
      .eq("template_id", checklist.template_id)
      .order("ordem"),
    supabase
      .from("checklist_respostas")
      .select("id, checklist_id, item_id, conforme, observacao, foto_url, created_at")
      .eq("checklist_id", checklist.id),
  ]);

  const itens = (itensData ?? []) as ChecklistItem[];
  const respostas = (respostasData ?? []) as ChecklistResposta[];

  return (
    <>
      <Header usuario={usuario} />
      <main className="flex flex-col gap-6 p-6">
        <div>
          <Link href="/lider" className="text-sm text-neutral-500">
            &larr; Home
          </Link>
          <h1 className="mt-1 text-lg font-semibold">
            <span className="font-mono text-neutral-500">{checklist.codigo}</span>{" "}
            {checklist.checklist_templates.nome}
          </h1>
          <p className="text-sm text-neutral-500">
            Template {checklist.checklist_templates.codigo} — status{" "}
            {checklist.status}
          </p>
        </div>

        {checklist.status === "aberto" ? (
          <Execucao
            checklistId={checklist.id}
            itens={itens}
            respostas={respostas}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {itens.map((item) => {
              const resposta = respostas.find((r) => r.item_id === item.id);
              return (
                <li
                  key={item.id}
                  className="rounded border border-neutral-200 bg-white px-4 py-3 text-sm"
                >
                  <span className="font-mono text-neutral-500">{item.codigo}</span>{" "}
                  {item.descricao}{" "}
                  <span
                    className={
                      resposta?.conforme ? "text-green-700" : "text-red-600"
                    }
                  >
                    {resposta?.conforme ? "Conforme" : "Nao conforme"}
                  </span>
                  {resposta && !resposta.conforme && (
                    <p className="mt-1 text-xs text-red-600">
                      {resposta.observacao}{" "}
                      {resposta.foto_url && (
                        <a
                          href={resposta.foto_url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          foto
                        </a>
                      )}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
