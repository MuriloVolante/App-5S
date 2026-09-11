import { contarItensPorTemplate, listarSetores, listarTemplates } from "@/lib/repo";
import TemplateForm from "./template-form";
import TemplateLinha from "./template-linha";

export default function TemplatesPage() {
  const templates = listarTemplates();
  const setores = listarSetores();
  const totais = contarItensPorTemplate();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="titulo">Templates de checklist</h1>
        <p className="subtitulo mt-1">{templates.length} cadastrados</p>
      </div>

      <TemplateForm setores={setores} />

      <table className="tabela">
        <thead>
          <tr>
            <th className="w-32">Codigo</th>
            <th>Nome / setor</th>
            <th className="w-20">Itens</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <TemplateLinha
              key={template.id}
              template={template}
              setores={setores}
              totalItens={totais.get(template.id) ?? 0}
            />
          ))}
          {templates.length === 0 && (
            <tr>
              <td colSpan={4} className="vazio">
                Nenhum template cadastrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
