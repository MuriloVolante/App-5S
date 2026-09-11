"use client";

import { useActionState } from "react";
import { ESTADO_INICIAL } from "@/lib/actions";
import { abrirChecklist } from "./actions";

export default function AbrirChecklist({
  templateId,
  desabilitado = false,
}: {
  templateId: string;
  desabilitado?: boolean;
}) {
  const [state, action, pendente] = useActionState(
    abrirChecklist,
    ESTADO_INICIAL
  );

  return (
    <form action={action} className="w-full sm:w-auto">
      <input type="hidden" name="template_id" value={templateId} />
      <button
        type="submit"
        disabled={pendente || desabilitado}
        className="botao botao-mini w-full"
        title={desabilitado ? "Checklist ainda sem itens" : undefined}
      >
        Abrir auditoria
      </button>
      {state.erro && <p className="erro mt-1">{state.erro}</p>}
    </form>
  );
}
