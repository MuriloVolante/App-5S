"use client";

import { useActionState, useEffect, useRef } from "react";
import { criarSetor } from "./actions";
import { ESTADO_INICIAL } from "@/lib/actions";
import { BOTAO, INPUT } from "@/components/ui";

export default function SetorForm() {
  const [state, action, pending] = useActionState(criarSetor, ESTADO_INICIAL);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex items-start gap-2">
      <div className="flex flex-col gap-1">
        <input
          name="nome"
          placeholder="Nome do setor"
          required
          className={`${INPUT} w-64`}
        />
        {state.erro && <span className="text-xs text-red-600">{state.erro}</span>}
      </div>
      <button type="submit" disabled={pending} className={BOTAO}>
        Adicionar
      </button>
    </form>
  );
}
