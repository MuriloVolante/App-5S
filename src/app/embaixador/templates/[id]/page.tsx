import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/header";
import Paginacao, { lerPagina } from "@/components/paginacao";
import { requirePapel } from "@/lib/auth";
import { contarItens, listarItensPagina, obterTemplate } from "@/lib/repo";
import ItemForm from "./item-form";
import ItemLinha from "./item-linha";
import { LINKS_EMBAIXADOR } from "../../links";

export default async function TemplateItensPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pagina?: string }>;
}) {
  const usuario = await requirePapel(["embaixador"]);
  const { id } = await params;
  const { pagina } = await searchParams;

  const template = obterTemplate(id);
  if (!template) notFound();
  if (template.setor_id !== usuario.setor_id) redirect("/embaixador/templates");

  const itens = listarItensPagina(template.id, lerPagina(pagina));
  const proximaOrdem = contarItens(template.id) + 1;

  return (
    <>
      <Header usuario={usuario} links={LINKS_EMBAIXADOR} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-5 sm:py-8">
        <div>
          <Link href="/embaixador/templates" className="link-voltar">
            &larr; Checklists do setor
          </Link>
          <h1 className="titulo mt-2 break-words">
            <span className="codigo">{template.codigo}</span> {template.nome}
          </h1>
          <p className="subtitulo mt-1">
            {itens.total} itens · o auditor responde cada item como conforme ou não
            conforme
          </p>
        </div>

        <ItemForm templateId={template.id} proximaOrdem={proximaOrdem} />

        <div className="tabela-rolagem">
          <table className="tabela">
            <thead>
              <tr>
                <th className="w-32">Código</th>
                <th>Descrição / ordem</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {itens.itens.map((item) => (
                <ItemLinha
                  key={`${item.id}:${item.descricao}:${item.ordem}`}
                  item={item}
                />
              ))}
              {itens.total === 0 && (
                <tr>
                  <td colSpan={3} className="vazio">
                    Nenhum item cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Paginacao
          base={`/embaixador/templates/${template.id}`}
          pagina={itens.pagina}
          paginas={itens.paginas}
          total={itens.total}
          rotulo="itens"
        />
      </main>
    </>
  );
}
