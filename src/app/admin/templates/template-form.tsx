"use client";

import { useActionState, useEffect, useRef } from "react";
import { ESTADO_INICIAL } from "@/lib/actions";
import { useAtualizarAposAcao } from "@/lib/atualizar";
import type { Setor } from "@/types";
import { criarTemplate } from "./actions";

export default function TemplateForm({ setores }: { setores: Setor[] }) {
  const [state, action, pendente] = useActionState(criarTemplate, ESTADO_INICIAL);
  useAtualizarAposAcao(state);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="cartao flex flex-col gap-3 p-4">
      <p className="subtitulo">Novo template</p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <label className="rotulo">Nome</label>
          <input
            name="nome"
            required
            placeholder="Ex: Inspeção diária"
            className="campo"
          />
        </div>
        <div className="min-w-[200px]">
          <label className="rotulo">Setor</label>
          <select name="setor_id" required defaultValue="" className="campo">
            <option value="" disabled>
              Selecione
            </option>
            {setores.map((setor) => (
              <option key={setor.id} value={setor.id}>
                {setor.codigo} · {setor.nome}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={pendente} className="botao">
          Adicionar
        </button>
      </div>
      {state.erro && <p className="erro">{state.erro}</p>}
      {setores.length === 0 && (
        <p className="nota">Cadastre um setor antes de criar templates.</p>
      )}
    </form>
  );
}
