"use client";

import { useActionState, useEffect, useRef } from "react";
import { criarTemplate } from "./actions";
import { ESTADO_INICIAL } from "@/lib/actions";
import { BOTAO, INPUT } from "@/components/ui";
import type { Setor } from "@/types";

export default function TemplateForm({ setores }: { setores: Setor[] }) {
  const [state, action, pending] = useActionState(criarTemplate, ESTADO_INICIAL);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          name="nome"
          placeholder="Nome do template"
          required
          className={`${INPUT} w-64`}
        />
        <select name="setor_id" required defaultValue="" className={INPUT}>
          <option value="" disabled>
            Setor
          </option>
          {setores.map((setor) => (
            <option key={setor.id} value={setor.id}>
              {setor.codigo} — {setor.nome}
            </option>
          ))}
        </select>
        <button type="submit" disabled={pending} className={BOTAO}>
          Adicionar
        </button>
      </div>
      {state.erro && <p className="text-xs text-red-600">{state.erro}</p>}
    </form>
  );
}
