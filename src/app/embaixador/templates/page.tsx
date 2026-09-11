import Header from "@/components/header";
import Paginacao, { lerPagina } from "@/components/paginacao";
import { requirePapel } from "@/lib/auth";
import { contarItens, listarTemplatesDoSetor } from "@/lib/repo";
import TemplateForm from "./template-form";
import TemplateLinha from "./template-linha";
import { LINKS_EMBAIXADOR } from "../links";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const usuario = await requirePapel(["embaixador"]);
  const { pagina } = await searchParams;
  const templates = listarTemplatesDoSetor(usuario.setor_id!, lerPagina(pagina));

  return (
    <>
      <Header usuario={usuario} links={LINKS_EMBAIXADOR} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-5 sm:py-8">
        <div>
          <h1 className="titulo">Checklists do meu setor</h1>
          <p className="subtitulo mt-1">
            {templates.total} cadastrados · o auditor usa estes checklists nas
            auditorias
          </p>
        </div>

        <TemplateForm />

        <div className="tabela-rolagem">
          <table className="tabela">
            <thead>
              <tr>
                <th className="w-32">Código</th>
                <th>Nome</th>
                <th className="w-20">Itens</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {templates.itens.map((template) => (
                <TemplateLinha
                  key={`${template.id}:${template.nome}`}
                  template={template}
                  totalItens={contarItens(template.id)}
                />
              ))}
              {templates.total === 0 && (
                <tr>
                  <td colSpan={4} className="vazio">
                    Nenhum checklist cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Paginacao
          base="/embaixador/templates"
          pagina={templates.pagina}
          paginas={templates.paginas}
          total={templates.total}
          rotulo="checklists"
        />
      </main>
    </>
  );
}
