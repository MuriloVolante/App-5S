import { createClient } from "@/lib/supabase/server";
import { TABELA, TH } from "@/components/ui";
import type { ChecklistTemplate, Setor } from "@/types";
import TemplateForm from "./template-form";
import TemplateLinha from "./template-linha";

export default async function TemplatesPage() {
  const supabase = await createClient();

  const [{ data: templatesData, error }, { data: setoresData }, { data: itensData }] =
    await Promise.all([
      supabase
        .from("checklist_templates")
        .select("id, codigo, setor_id, nome, created_at")
        .order("codigo"),
      supabase
        .from("setores")
        .select("id, codigo, nome, created_at")
        .order("codigo"),
      supabase.from("checklist_items").select("template_id"),
    ]);

  const templates = (templatesData ?? []) as ChecklistTemplate[];
  const setores = (setoresData ?? []) as Setor[];

  const totalPorTemplate = new Map<string, number>();
  for (const item of (itensData ?? []) as { template_id: string }[]) {
    totalPorTemplate.set(
      item.template_id,
      (totalPorTemplate.get(item.template_id) ?? 0) + 1
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Templates de checklist</h1>
      <TemplateForm setores={setores} />
      {error && <p className="text-sm text-red-600">{error.message}</p>}
      <table className={TABELA}>
        <thead>
          <tr>
            <th className={TH}>Codigo</th>
            <th className={TH}>Nome / setor</th>
            <th className={TH}>Itens</th>
            <th className={TH} />
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <TemplateLinha
              key={template.id}
              template={template}
              setores={setores}
              totalItens={totalPorTemplate.get(template.id) ?? 0}
            />
          ))}
          {templates.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-4 text-sm text-neutral-500">
                Nenhum template cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
