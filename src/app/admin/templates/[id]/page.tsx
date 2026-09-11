import Link from "next/link";
import { notFound } from "next/navigation";
import { listarItens, listarSetores, obterTemplate } from "@/lib/repo";
import ItemForm from "./item-form";
import ItemLinha from "./item-linha";

export default async function TemplateItensPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = obterTemplate(id);
  if (!template) notFound();

  const itens = listarItens(template.id);
  const setor = listarSetores().find((item) => item.id === template.setor_id);
  const proximaOrdem =
    itens.reduce((maior, item) => Math.max(maior, item.ordem), 0) + 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/templates" className="link-voltar">
          &larr; Templates
        </Link>
        <h1 className="titulo mt-2">
          <span className="codigo">{template.codigo}</span> {template.nome}
        </h1>
        <p className="subtitulo mt-1">
          Setor {setor ? `${setor.codigo} · ${setor.nome}` : "—"} · {itens.length}{" "}
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
          {itens.map((item) => (
            <ItemLinha key={item.id} item={item} />
          ))}
          {itens.length === 0 && (
            <tr>
              <td colSpan={3} className="vazio">
                Nenhum item cadastrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
        </div>
    </div>
  );
}
