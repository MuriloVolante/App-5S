"use client";

import { useActionState, useEffect, useRef } from "react";
import { ESTADO_INICIAL } from "@/lib/actions";
import { criarSetor } from "./actions";

export default function SetorForm() {
  const [state, action, pendente] = useActionState(criarSetor, ESTADO_INICIAL);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="cartao flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[260px] flex-1">
          <label className="rotulo" htmlFor="nome-setor">
            Novo setor
          </label>
          <input
            id="nome-setor"
            name="nome"
            required
            placeholder="Ex: Producao"
            className="campo"
          />
        </div>
        <button type="submit" disabled={pendente} className="botao">
          Adicionar
        </button>
      </div>
      {state.erro && <p className="erro">{state.erro}</p>}
    </form>
  );
}
