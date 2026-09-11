"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ESTADO_INICIAL } from "@/lib/actions";
import type { ChecklistTemplate, Setor } from "@/types";
import { atualizarTemplate, excluirTemplate } from "./actions";

export default function TemplateLinha({
  template,
  setores,
  totalItens,
}: {
  template: ChecklistTemplate;
  setores: Setor[];
  totalItens: number;
}) {
  const [salvo, salvar, salvando] = useActionState(
    atualizarTemplate,
    ESTADO_INICIAL
  );
  const [removido, remover, removendo] = useActionState(
    excluirTemplate,
    ESTADO_INICIAL
  );
  const erro = salvo.erro ?? removido.erro;
  const formId = `template-${template.id}`;

  return (
    <tr>
      <td className="codigo align-top">{template.codigo}</td>
      <td>
        <form action={salvar} id={formId} className="flex flex-wrap gap-3">
          <input type="hidden" name="id" value={template.id} />
          <div className="min-w-[200px] flex-1">
            <label className="rotulo">Nome</label>
            <input
              name="nome"
              defaultValue={template.nome}
              required
              className="campo"
            />
          </div>
          <div className="min-w-[190px]">
            <label className="rotulo">Setor</label>
            <select
              name="setor_id"
              defaultValue={template.setor_id}
              className="campo"
            >
              {setores.map((setor) => (
                <option key={setor.id} value={setor.id}>
                  {setor.codigo} · {setor.nome}
                </option>
              ))}
            </select>
          </div>
        </form>
        {erro && <p className="erro mt-1">{erro}</p>}
      </td>
      <td className="align-top">{totalItens}</td>
      <td className="align-top">
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            form={formId}
            disabled={salvando}
            className="botao botao-secundario botao-mini"
          >
            Salvar
          </button>
          <Link
            href={`/admin/templates/${template.id}`}
            className="botao botao-laranja botao-mini"
          >
            Itens
          </Link>
          <form action={remover}>
            <input type="hidden" name="id" value={template.id} />
            <button
              type="submit"
              disabled={removendo}
              className="botao botao-perigo botao-mini"
            >
              Excluir
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
