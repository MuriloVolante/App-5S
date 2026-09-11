import Paginacao, { lerPagina } from "@/components/paginacao";
import { contarItens, listarSetores, listarTemplates } from "@/lib/repo";
import TemplateForm from "./template-form";
import TemplateLinha from "./template-linha";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const { pagina } = await searchParams;
  const templates = listarTemplates(lerPagina(pagina));
  const setores = listarSetores();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="titulo">Templates de checklist</h1>
        <p className="subtitulo mt-1">{templates.total} cadastrados</p>
      </div>

      <TemplateForm setores={setores} />

      <div className="tabela-rolagem">
        <table className="tabela">
          <thead>
            <tr>
              <th className="w-32">Código</th>
              <th>Nome / setor</th>
              <th className="w-20">Itens</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {templates.itens.map((template) => (
              <TemplateLinha
                key={template.id}
                template={template}
                setores={setores}
                totalItens={contarItens(template.id)}
              />
            ))}
            {templates.total === 0 && (
              <tr>
                <td colSpan={4} className="vazio">
                  Nenhum template cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Paginacao
        base="/admin/templates"
        pagina={templates.pagina}
        paginas={templates.paginas}
        total={templates.total}
        rotulo="templates"
      />
    </div>
  );
}
