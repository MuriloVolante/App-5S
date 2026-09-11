"use client";

import { useActionState } from "react";
import Foto from "@/components/foto";
import { ESTADO_INICIAL } from "@/lib/actions";
import { useAtualizarAposAcao } from "@/lib/atualizar";
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
  useAtualizarAposAcao(concluido);
  useAtualizarAposAcao(resetado);
  const erro = concluido.erro ?? resetado.erro;
  const ocupado = concluindo || resetando;

  return (
    <li className="cartao-plano item-linha item-nao-conforme flex flex-col gap-3 p-3 sm:p-4">
      <div className="flex min-w-0 gap-3">
        <Foto url={acao.foto_url} legenda={acao.codigo} />
        <div className="min-w-0 flex-1">
          <p className="codigo">{acao.codigo}</p>
          <p className="mt-1 break-words">{acao.descricao_problema}</p>
        </div>
      </div>

      <div className="dados-acao">
        <span>
          <span className="dado-rotulo block">Prazo original</span>
          {acao.prazo
            ? new Date(`${acao.prazo}T00:00:00`).toLocaleDateString("pt-BR")
            : "—"}
        </span>
        <span>
          <span className="dado-rotulo block">Resets</span>
          {acao.reset_count}
        </span>
        <span>
          <span className="dado-rotulo block">Aberta em</span>
          {new Date(acao.aberto_em).toLocaleDateString("pt-BR")}
        </span>
      </div>

      {erro && <p className="erro">{erro}</p>}

      <div className="cartao-item-acoes">
        <form action={acaoConcluir}>
          <input type="hidden" name="id" value={acao.id} />
          <button type="submit" disabled={ocupado} className="botao w-full">
            Concluir
          </button>
        </form>
        <form action={acaoResetar}>
          <input type="hidden" name="id" value={acao.id} />
          <button
            type="submit"
            disabled={ocupado}
            className="botao botao-perigo w-full"
          >
            Resetar
          </button>
        </form>
      </div>
    </li>
  );
}
