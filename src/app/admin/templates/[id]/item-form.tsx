"use client";

import { useActionState, useEffect, useRef } from "react";
import { ESTADO_INICIAL } from "@/lib/actions";
import { criarItem } from "../actions";

export default function ItemForm({
  templateId,
  proximaOrdem,
}: {
  templateId: string;
  proximaOrdem: number;
}) {
  const [state, action, pendente] = useActionState(criarItem, ESTADO_INICIAL);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="cartao flex flex-col gap-3 p-4">
      <p className="subtitulo">Novo item</p>
      <div className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="template_id" value={templateId} />
        <div className="min-w-[280px] flex-1">
          <label className="rotulo">Descricao</label>
          <input
            name="descricao"
            required
            placeholder="Ex: Extintores desobstruidos"
            className="campo"
          />
        </div>
        <div className="w-24">
          <label className="rotulo">Ordem</label>
          <input
            name="ordem"
            type="number"
            min={1}
            defaultValue={proximaOrdem}
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
