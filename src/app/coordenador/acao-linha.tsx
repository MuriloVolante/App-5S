"use client";

import { useActionState } from "react";
import { definirPrazo } from "./actions";
import { ESTADO_INICIAL } from "@/lib/actions";
import { BOTAO_SEC, INPUT, TD } from "@/components/ui";
import type { Acao } from "@/types";

export default function AcaoLinha({ acao }: { acao: Acao }) {
  const [state, action, pending] = useActionState(definirPrazo, ESTADO_INICIAL);

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
        {state.erro && <p className="mt-1 text-xs text-red-600">{state.erro}</p>}
      </td>
      <td className={TD}>{acao.status}</td>
      <td className={TD}>
        {acao.status === "aberta" ? (
          <form action={action} className="flex gap-2">
            <input type="hidden" name="id" value={acao.id} />
            <input type="date" name="prazo" required className={INPUT} />
            <button type="submit" disabled={pending} className={BOTAO_SEC}>
              Definir prazo
            </button>
          </form>
        ) : (
          <span className="text-neutral-600">
            {acao.prazo ? new Date(`${acao.prazo}T00:00:00`).toLocaleDateString("pt-BR") : "—"}
          </span>
        )}
      </td>
      <td className={`${TD} text-neutral-500`}>{acao.reset_count}</td>
    </tr>
  );
}
