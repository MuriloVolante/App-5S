import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TABELA, TH } from "@/components/ui";
import type { ChecklistItem, ChecklistTemplate, Setor } from "@/types";
import ItemForm from "./item-form";
import ItemLinha from "./item-linha";

export default async function TemplateItensPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: template } = await supabase
    .from("checklist_templates")
    .select("id, codigo, setor_id, nome, created_at, setores (codigo, nome)")
    .eq("id", id)
    .single<ChecklistTemplate & { setores: Pick<Setor, "codigo" | "nome"> }>();

  if (!template) notFound();

  const { data: itensData } = await supabase
    .from("checklist_items")
    .select("id, codigo, template_id, descricao, ordem, created_at")
    .eq("template_id", id)
    .order("ordem");

  const itens = (itensData ?? []) as ChecklistItem[];
  const proximaOrdem =
    itens.reduce((maior, item) => Math.max(maior, item.ordem), 0) + 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/templates" className="text-sm text-neutral-500">
          &larr; Templates
        </Link>
        <h1 className="mt-1 text-lg font-semibold">
          <span className="font-mono text-neutral-500">{template.codigo}</span>{" "}
          {template.nome}
        </h1>
        <p className="text-sm text-neutral-500">
          Setor {template.setores.codigo} — {template.setores.nome}
        </p>
      </div>
      <ItemForm templateId={template.id} proximaOrdem={proximaOrdem} />
      <table className={TABELA}>
        <thead>
          <tr>
            <th className={TH}>Codigo</th>
            <th className={TH}>Descricao / ordem</th>
            <th className={TH} />
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <ItemLinha key={item.id} item={item} />
          ))}
          {itens.length === 0 && (
            <tr>
              <td colSpan={3} className="px-3 py-4 text-sm text-neutral-500">
                Nenhum item cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
