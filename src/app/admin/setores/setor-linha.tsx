"use client";

import { useActionState } from "react";
import { atualizarSetor, excluirSetor } from "./actions";
import { ESTADO_INICIAL } from "@/lib/actions";
import { BOTAO_SEC, INPUT, TD } from "@/components/ui";
import type { Setor } from "@/types";

export default function SetorLinha({ setor }: { setor: Setor }) {
  const [salvar, acaoSalvar, salvando] = useActionState(
    atualizarSetor,
    ESTADO_INICIAL
  );
  const [excluir, acaoExcluir, excluindo] = useActionState(
    excluirSetor,
    ESTADO_INICIAL
  );
  const erro = salvar.erro ?? excluir.erro;

  return (
    <tr>
      <td className={`${TD} font-mono text-neutral-500`}>{setor.codigo}</td>
      <td className={TD}>
        <form action={acaoSalvar} id={`setor-${setor.id}`} className="flex gap-2">
          <input type="hidden" name="id" value={setor.id} />
          <input
            name="nome"
            defaultValue={setor.nome}
            required
            className={`${INPUT} w-64`}
          />
        </form>
        {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
      </td>
      <td className={TD}>
        <div className="flex gap-2">
          <button
            type="submit"
            form={`setor-${setor.id}`}
            disabled={salvando}
            className={BOTAO_SEC}
          >
            Salvar
          </button>
          <form action={acaoExcluir}>
            <input type="hidden" name="id" value={setor.id} />
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
