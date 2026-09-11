"use client";

import { useActionState } from "react";
import { ESTADO_INICIAL } from "@/lib/actions";
import type { Acao } from "@/types";
import { concluir, resetar } from "./actions";

export default function AcaoVencida({ acao }: { acao: Acao }) {
  const [concluido, acaoConcluir, concluindo] = useActionState(
    concluir,
    ESTADO_INICIAL
  );
  const [resetado, acaoResetar, resetando] = useActionState(
    resetar,
    ESTADO_INICIAL
  );
  const erro = concluido.erro ?? resetado.erro;
  const ocupado = concluindo || resetando;

  return (
    <tr>
      <td className="codigo align-top">{acao.codigo}</td>
      <td>
        {acao.descricao_problema}
        <p className="nota mt-1">
          <a
            href={acao.foto_url}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            ver foto
          </a>
        </p>
        {erro && <p className="erro mt-1">{erro}</p>}
      </td>
      <td className="align-top">
        {acao.prazo
          ? new Date(`${acao.prazo}T00:00:00`).toLocaleDateString("pt-BR")
          : "—"}
      </td>
      <td className="align-top">{acao.reset_count}</td>
      <td className="align-top">
        <div className="flex justify-end gap-2">
          <form action={acaoConcluir}>
            <input type="hidden" name="id" value={acao.id} />
            <button
              type="submit"
              disabled={ocupado}
              className="botao botao-mini"
            >
              Concluir
            </button>
          </form>
          <form action={acaoResetar}>
            <input type="hidden" name="id" value={acao.id} />
            <button
              type="submit"
              disabled={ocupado}
              className="botao botao-perigo botao-mini"
            >
              Resetar
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
