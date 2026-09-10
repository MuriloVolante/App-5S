"use client";

import { useActionState } from "react";
import { criarChecklist } from "./actions";
import { ESTADO_INICIAL } from "@/lib/actions";
import { BOTAO_SEC } from "@/components/ui";

export default function CriarChecklist({ templateId }: { templateId: string }) {
  const [state, action, pending] = useActionState(
    criarChecklist,
    ESTADO_INICIAL
  );

  return (
    <form action={action}>
      <input type="hidden" name="template_id" value={templateId} />
      <button type="submit" disabled={pending} className={BOTAO_SEC}>
        Criar checklist
      </button>
      {state.erro && <p className="mt-1 text-xs text-red-600">{state.erro}</p>}
    </form>
  );
}
