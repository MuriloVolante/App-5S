import Link from "next/link";
import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Checklist, ChecklistTemplate } from "@/types";
import CriarChecklist from "./criar-checklist";

export default async function LiderPage() {
  const usuario = await requirePapel(["lider"]);
  const supabase = await createClient();

  const [{ data: templatesData }, { data: checklistsData }] = await Promise.all([
    supabase
      .from("checklist_templates")
      .select("id, codigo, setor_id, nome, created_at")
      .eq("setor_id", usuario.setor_id!)
      .order("codigo"),
    supabase
      .from("checklists")
      .select(
        "id, codigo, setor_id, lider_id, template_id, data_criacao, status, finalizado_em"
      )
      .eq("lider_id", usuario.id)
      .order("data_criacao", { ascending: false })
      .limit(20),
  ]);

  const templates = (templatesData ?? []) as ChecklistTemplate[];
  const checklists = (checklistsData ?? []) as Checklist[];

  return (
    <>
      <Header usuario={usuario} />
      <main className="flex flex-col gap-8 p-6">
        <section className="flex flex-col gap-3">
          <h1 className="text-lg font-semibold">Templates do meu setor</h1>
          {templates.length === 0 && (
            <p className="text-sm text-neutral-500">
              Nenhum template cadastrado para o seu setor.
            </p>
          )}
          <ul className="flex flex-col gap-2">
            {templates.map((template) => (
              <li
                key={template.id}
                className="flex items-center justify-between rounded border border-neutral-200 bg-white px-4 py-3 text-sm"
              >
                <span>
                  <span className="font-mono text-neutral-500">
                    {template.codigo}
                  </span>{" "}
                  {template.nome}
                </span>
                <CriarChecklist templateId={template.id} />
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Meus checklists</h2>
          {checklists.length === 0 && (
            <p className="text-sm text-neutral-500">Nenhum checklist criado.</p>
          )}
          <ul className="flex flex-col gap-2">
            {checklists.map((checklist) => (
              <li key={checklist.id}>
                <Link
                  href={`/lider/checklists/${checklist.id}`}
                  className="flex items-center justify-between rounded border border-neutral-200 bg-white px-4 py-3 text-sm hover:border-neutral-400"
                >
                  <span className="font-mono text-neutral-500">
                    {checklist.codigo}
                  </span>
                  <span className="text-neutral-500">
                    {new Date(checklist.data_criacao).toLocaleString("pt-BR")}
                  </span>
                  <span
                    className={
                      checklist.status === "aberto"
                        ? "text-amber-700"
                        : "text-green-700"
                    }
                  >
                    {checklist.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
