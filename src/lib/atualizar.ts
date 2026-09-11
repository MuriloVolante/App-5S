"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { EstadoAcao } from "@/lib/actions";

// Server Actions com useActionState nao redesenham a lista sozinhas:
// o payload da rota fica em cache e os campos continuam mostrando o valor antigo.
export function useAtualizarAposAcao(estado: EstadoAcao) {
  const router = useRouter();

  useEffect(() => {
    if (estado.ok) router.refresh();
  }, [estado, router]);
}
