"use client";

import Link from "next/link";
import { useActionState } from "react";
import { atualizarTemplate, excluirTemplate } from "./actions";
import { ESTADO_INICIAL } from "@/lib/actions";
import { BOTAO_SEC, INPUT, TD } from "@/components/ui";
import type { ChecklistTemplate, Setor } from "@/types";

export default function TemplateLinha({
  template,
  setores,
  totalItens,
}: {
  template: ChecklistTemplate;
  setores: Setor[];
  totalItens: number;
}) {
  const [salvar, acaoSalvar, salvando] = useActionState(
    atualizarTemplate,
    ESTADO_INICIAL
  );
  const [excluir, acaoExcluir, excluindo] = useActionState(
    excluirTemplate,
    ESTADO_INICIAL
  );
  const erro = salvar.erro ?? excluir.erro;
  const formId = `template-${template.id}`;

  return (
    <tr>
      <td className={`${TD} font-mono text-neutral-500`}>{template.codigo}</td>
      <td className={TD}>
        <form action={acaoSalvar} id={formId} className="flex flex-wrap gap-2">
          <input type="hidden" name="id" value={template.id} />
          <input
            name="nome"
            defaultValue={template.nome}
            required
            className={`${INPUT} w-64`}
          />
          <select
            name="setor_id"
            defaultValue={template.setor_id}
            className={INPUT}
          >
            {setores.map((setor) => (
              <option key={setor.id} value={setor.id}>
                {setor.codigo} — {setor.nome}
              </option>
            ))}
          </select>
        </form>
        {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
      </td>
      <td className={`${TD} text-neutral-500`}>{totalItens}</td>
      <td className={TD}>
        <div className="flex gap-2">
          <button
            type="submit"
            form={formId}
            disabled={salvando}
            className={BOTAO_SEC}
          >
            Salvar
          </button>
          <Link href={`/admin/templates/${template.id}`} className={BOTAO_SEC}>
            Itens
          </Link>
          <form action={acaoExcluir}>
            <input type="hidden" name="id" value={template.id} />
            <button
              type="submit"
              disabled={excluindo}
              className={`${BOTAO_SEC} text-red-600`}
            >
              Excluir
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
