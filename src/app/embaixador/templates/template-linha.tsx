"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ESTADO_INICIAL } from "@/lib/actions";
import { useAtualizarAposAcao } from "@/lib/atualizar";
import type { ChecklistTemplate } from "@/types";
import { atualizarTemplate, excluirTemplate } from "./actions";

export default function TemplateLinha({
  template,
  totalItens,
}: {
  template: ChecklistTemplate;
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
  useAtualizarAposAcao(salvo);
  useAtualizarAposAcao(removido);

  const erro = salvo.erro ?? removido.erro;
  const formId = `template-${template.id}`;
  const semItens = totalItens === 0;

  return (
    <tr>
      <td className="codigo align-top">{template.codigo}</td>
      <td>
        <form action={salvar} id={formId}>
          <input type="hidden" name="id" value={template.id} />
          <input
            name="nome"
            defaultValue={template.nome}
            required
            className="campo max-w-md"
          />
        </form>
        {erro && <p className="erro mt-1">{erro}</p>}
        {semItens && (
          <p className="nota mt-1">
            Sem itens: o auditor ainda não consegue usar este checklist.
          </p>
        )}
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
            href={`/embaixador/templates/${template.id}`}
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
