"use client";

import { useActionState } from "react";
import { ESTADO_INICIAL } from "@/lib/actions";
import type { Setor } from "@/types";
import { atualizarSetor, excluirSetor } from "./actions";

export default function SetorLinha({ setor }: { setor: Setor }) {
  const [salvo, salvar, salvando] = useActionState(
    atualizarSetor,
    ESTADO_INICIAL
  );
  const [removido, remover, removendo] = useActionState(
    excluirSetor,
    ESTADO_INICIAL
  );
  const erro = salvo.erro ?? removido.erro;
  const formId = `setor-${setor.id}`;

  return (
    <tr>
      <td className="codigo">{setor.codigo}</td>
      <td>
        <form action={salvar} id={formId}>
          <input type="hidden" name="id" value={setor.id} />
          <input
            name="nome"
            defaultValue={setor.nome}
            required
            className="campo max-w-sm"
          />
        </form>
        {erro && <p className="erro mt-1">{erro}</p>}
      </td>
      <td>
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
            <input type="hidden" name="id" value={setor.id} />
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
