"use client";

import { useActionState } from "react";
import Foto from "@/components/foto";
import { ESTADO_INICIAL } from "@/lib/actions";
import { useAtualizarAposAcao } from "@/lib/atualizar";
import { ROTULO_STATUS_ACAO, type Acao } from "@/types";
import { definirPrazo } from "./actions";

export default function AcaoLinha({ acao }: { acao: Acao }) {
  const [state, action, pendente] = useActionState(definirPrazo, ESTADO_INICIAL);
  useAtualizarAposAcao(state);

  return (
    <tr>
      <td className="codigo align-top">{acao.codigo}</td>
      <td className="align-top">
        <Foto url={acao.foto_url} legenda={acao.codigo} />
      </td>
      <td>
        {acao.descricao_problema}
        <p className="nota mt-1">
          aberta em {new Date(acao.aberto_em).toLocaleDateString("pt-BR")}
        </p>
        {state.erro && <p className="erro mt-1">{state.erro}</p>}
      </td>
      <td className="align-top">
        <span className={`selo selo-${acao.status}`}>
          {ROTULO_STATUS_ACAO[acao.status]}
        </span>
      </td>
      <td className="align-top">
        {acao.status === "aberta" ? (
          <form action={action} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="id" value={acao.id} />
            <div>
              <label className="rotulo">Prazo</label>
              <input type="date" name="prazo" required className="campo" />
            </div>
            <button type="submit" disabled={pendente} className="botao botao-mini">
              Definir
            </button>
          </form>
        ) : acao.prazo ? (
          new Date(`${acao.prazo}T00:00:00`).toLocaleDateString("pt-BR")
        ) : (
          "—"
        )}
      </td>
      <td className="align-top">{acao.reset_count}</td>
    </tr>
  );
}
