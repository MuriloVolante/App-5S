"use client";

import { useActionState, useEffect, useRef } from "react";
import { criarItem } from "../actions";
import { ESTADO_INICIAL } from "@/lib/actions";
import { BOTAO, INPUT } from "@/components/ui";

export default function ItemForm({
  templateId,
  proximaOrdem,
}: {
  templateId: string;
  proximaOrdem: number;
}) {
  const [state, action, pending] = useActionState(criarItem, ESTADO_INICIAL);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="template_id" value={templateId} />
        <input
          name="descricao"
          placeholder="Descricao do item"
          required
          className={`${INPUT} w-96`}
        />
        <input
          name="ordem"
          type="number"
          min={1}
          defaultValue={proximaOrdem}
          className={`${INPUT} w-24`}
        />
        <button type="submit" disabled={pending} className={BOTAO}>
          Adicionar
        </button>
      </div>
      {state.erro && <p className="text-xs text-red-600">{state.erro}</p>}
    </form>
  );
}
