"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ESTADO_INICIAL } from "@/lib/actions";
import { useAtualizarAposAcao } from "@/lib/atualizar";
import type { Setor } from "@/types";
import CamposPapelSetor from "./campos-papel-setor";
import { criarUsuario } from "./actions";

export default function UsuarioForm({ setores }: { setores: Setor[] }) {
  const [state, action, pendente] = useActionState(criarUsuario, ESTADO_INICIAL);
  useAtualizarAposAcao(state);
  const ref = useRef<HTMLFormElement>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      setVersao((atual) => atual + 1);
    }
  }, [state]);

  return (
    <form ref={ref} action={action} className="cartao flex flex-col gap-3 p-4">
      <p className="subtitulo">Novo usuário</p>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[170px] flex-1">
          <label className="rotulo">Nome</label>
          <input name="nome" required className="campo" />
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="rotulo">E-mail</label>
          <input name="email" type="email" required className="campo" />
        </div>
        <div className="min-w-[150px]">
          <label className="rotulo">Senha</label>
          <input
            name="senha"
            type="password"
            minLength={6}
            required
            className="campo"
          />
        </div>
        <CamposPapelSetor
          key={versao}
          setores={setores}
          papelInicial="auditor"
        />
        <button type="submit" disabled={pendente} className="botao">
          Adicionar
        </button>
      </div>
      {state.erro && <p className="erro">{state.erro}</p>}
    </form>
  );
}
