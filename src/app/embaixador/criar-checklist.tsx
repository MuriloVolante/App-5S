"use client";

import { useActionState } from "react";
import { ESTADO_INICIAL } from "@/lib/actions";
import { criarChecklist } from "./actions";

export default function CriarChecklist({ templateId }: { templateId: string }) {
  const [state, action, pendente] = useActionState(
    criarChecklist,
    ESTADO_INICIAL
  );

  return (
    <form action={action} className="w-full sm:w-auto">
      <input type="hidden" name="template_id" value={templateId} />
      <button
        type="submit"
        disabled={pendente}
        className="botao botao-mini w-full"
      >
        Abrir checklist
      </button>
      {state.erro && <p className="erro mt-1">{state.erro}</p>}
    </form>
  );
}
