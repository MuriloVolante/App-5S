"use client";

import { useActionState, useEffect, useRef } from "react";
import { criarUsuario } from "./actions";
import { ESTADO_INICIAL } from "@/lib/actions";
import { BOTAO, INPUT } from "@/components/ui";
import type { Setor } from "@/types";
import CamposPapelSetor from "./campos-papel-setor";

export default function UsuarioForm({ setores }: { setores: Setor[] }) {
  const [state, action, pending] = useActionState(criarUsuario, ESTADO_INICIAL);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input name="nome" placeholder="Nome" required className={INPUT} />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className={INPUT}
        />
        <input
          name="senha"
          type="password"
          placeholder="Senha inicial"
          minLength={6}
          required
          className={INPUT}
        />
        <CamposPapelSetor setores={setores} />
        <button type="submit" disabled={pending} className={BOTAO}>
          Adicionar
        </button>
      </div>
      {state.erro && <p className="text-xs text-red-600">{state.erro}</p>}
    </form>
  );
}
