"use client";

import { useActionState } from "react";
import { concluirAcao, resetarAcao } from "./actions";
import { ESTADO_INICIAL } from "@/lib/actions";
import { BOTAO_SEC, TD } from "@/components/ui";
import type { Acao } from "@/types";

export default function AcaoVencida({ acao }: { acao: Acao }) {
  const [concluir, acaoConcluir, concluindo] = useActionState(
    concluirAcao,
    ESTADO_INICIAL
  );
  const [resetar, acaoResetar, resetando] = useActionState(
    resetarAcao,
    ESTADO_INICIAL
  );
  const erro = concluir.erro ?? resetar.erro;

  return (
    <tr>
      <td className={`${TD} font-mono text-neutral-500`}>{acao.codigo}</td>
      <td className={TD}>
        {acao.descricao_problema}{" "}
        <a
          href={acao.foto_url}
          target="_blank"
          rel="noreferrer"
          className="text-xs underline"
        >
          foto
        </a>
        {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
      </td>
      <td className={TD}>
        {acao.prazo
          ? new Date(`${acao.prazo}T00:00:00`).toLocaleDateString("pt-BR")
          : "—"}
      </td>
      <td className={`${TD} text-neutral-500`}>{acao.reset_count}</td>
      <td className={TD}>
        <div className="flex gap-2">
          <form action={acaoConcluir}>
            <input type="hidden" name="id" value={acao.id} />
            <button
              type="submit"
              disabled={concluindo || resetando}
              className={`${BOTAO_SEC} text-green-700`}
            >
              Concluir
            </button>
          </form>
          <form action={acaoResetar}>
            <input type="hidden" name="id" value={acao.id} />
            <button
              type="submit"
              disabled={concluindo || resetando}
              className={`${BOTAO_SEC} text-red-600`}
            >
              Resetar
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
