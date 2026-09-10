"use client";

import { useActionState } from "react";
import { atualizarItem, excluirItem } from "../actions";
import { ESTADO_INICIAL } from "@/lib/actions";
import { BOTAO_SEC, INPUT, TD } from "@/components/ui";
import type { ChecklistItem } from "@/types";

export default function ItemLinha({ item }: { item: ChecklistItem }) {
  const [salvar, acaoSalvar, salvando] = useActionState(
    atualizarItem,
    ESTADO_INICIAL
  );
  const [excluir, acaoExcluir, excluindo] = useActionState(
    excluirItem,
    ESTADO_INICIAL
  );
  const erro = salvar.erro ?? excluir.erro;
  const formId = `item-${item.id}`;

  return (
    <tr>
      <td className={`${TD} font-mono text-neutral-500`}>{item.codigo}</td>
      <td className={TD}>
        <form action={acaoSalvar} id={formId} className="flex flex-wrap gap-2">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="template_id" value={item.template_id} />
          <input
            name="descricao"
            defaultValue={item.descricao}
            required
            className={`${INPUT} w-96`}
          />
          <input
            name="ordem"
            type="number"
            min={1}
            defaultValue={item.ordem}
            className={`${INPUT} w-24`}
          />
        </form>
        {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
      </td>
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
          <form action={acaoExcluir}>
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="template_id" value={item.template_id} />
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
