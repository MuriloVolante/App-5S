import Link from "next/link";
import { notFound } from "next/navigation";
import Paginacao, { lerPagina } from "@/components/paginacao";
import {
  contarItens,
  listarItensPagina,
  listarSetores,
  obterTemplate,
} from "@/lib/repo";
import ItemForm from "./item-form";
import ItemLinha from "./item-linha";

export default async function TemplateItensPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pagina?: string }>;
}) {
  const { id } = await params;
  const { pagina } = await searchParams;

  const template = obterTemplate(id);
  if (!template) notFound();

  const itens = listarItensPagina(template.id, lerPagina(pagina));
  const setor = listarSetores().find((item) => item.id === template.setor_id);
  const proximaOrdem = contarItens(template.id) + 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/templates" className="link-voltar">
          &larr; Templates
        </Link>
        <h1 className="titulo mt-2 break-words">
          <span className="codigo">{template.codigo}</span> {template.nome}
        </h1>
        <p className="subtitulo mt-1">
          Setor {setor ? `${setor.codigo} · ${setor.nome}` : "—"} · {itens.total}{" "}
          itens
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
              <ItemLinha key={`${item.id}:${item.descricao}:${item.ordem}`} item={item} />
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
        base={`/admin/templates/${template.id}`}
        pagina={itens.pagina}
        paginas={itens.paginas}
        total={itens.total}
        rotulo="itens"
      />
    </div>
  );
}
