"use client";

import { useState } from "react";
import { INPUT } from "@/components/ui";
import type { Papel, Setor } from "@/types";

export default function CamposPapelSetor({
  setores,
  papelInicial = "lider",
  setorInicial = "",
}: {
  setores: Setor[];
  papelInicial?: Papel;
  setorInicial?: string;
}) {
  const [papel, setPapel] = useState<Papel>(papelInicial);

  return (
    <>
      <select
        name="papel"
        value={papel}
        onChange={(e) => setPapel(e.target.value as Papel)}
        className={INPUT}
      >
        <option value="lider">Lider</option>
        <option value="coordenador">Coordenador</option>
        <option value="admin">Admin</option>
      </select>
      <select
        name="setor_id"
        defaultValue={setorInicial}
        disabled={papel === "admin"}
        className={`${INPUT} disabled:bg-neutral-100 disabled:text-neutral-400`}
      >
        <option value="">Sem setor</option>
        {setores.map((setor) => (
          <option key={setor.id} value={setor.id}>
            {setor.codigo} — {setor.nome}
          </option>
        ))}
      </select>
    </>
  );
}
