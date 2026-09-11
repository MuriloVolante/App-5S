"use client";

import { useActionState } from "react";
import { ESTADO_INICIAL } from "@/lib/actions";
import type { ChecklistItem } from "@/types";
import { atualizarItem, excluirItem } from "../actions";

export default function ItemLinha({ item }: { item: ChecklistItem }) {
  const [salvo, salvar, salvando] = useActionState(atualizarItem, ESTADO_INICIAL);
  const [removido, remover, removendo] = useActionState(
    excluirItem,
    ESTADO_INICIAL
  );
  const erro = salvo.erro ?? removido.erro;
  const formId = `item-${item.id}`;

  return (
    <tr>
      <td className="codigo align-top">{item.codigo}</td>
      <td>
        <form action={salvar} id={formId} className="flex flex-wrap gap-3">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="template_id" value={item.template_id} />
          <div className="min-w-[260px] flex-1">
            <label className="rotulo">Descrição</label>
            <input
              name="descricao"
              defaultValue={item.descricao}
              required
              className="campo"
            />
          </div>
          <div className="w-24">
            <label className="rotulo">Ordem</label>
            <input
              name="ordem"
              type="number"
              min={1}
              defaultValue={item.ordem}
              className="campo"
            />
          </div>
        </form>
        {erro && <p className="erro mt-1">{erro}</p>}
      </td>
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
          <form action={remover}>
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="template_id" value={item.template_id} />
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
