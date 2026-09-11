"use client";

import { useState } from "react";
import type { Papel, Setor } from "@/types";

export default function CamposPapelSetor({
  setores,
  papelInicial = null,
  setorInicial = "",
}: {
  setores: Setor[];
  papelInicial?: Papel | null;
  setorInicial?: string;
}) {
  const [papel, setPapel] = useState<string>(papelInicial ?? "");

  return (
    <>
      <div className="min-w-[150px]">
        <label className="rotulo">Papel</label>
        <select
          name="papel"
          value={papel}
          onChange={(evento) => setPapel(evento.target.value)}
          className="campo"
        >
          <option value="">Sem papel</option>
          <option value="auditor">Auditor</option>
          <option value="embaixador">Embaixador</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="min-w-[190px]">
        <label className="rotulo">Setor</label>
        <select
          name="setor_id"
          defaultValue={setorInicial}
          disabled={papel !== "embaixador"}
          className="campo"
        >
          <option value="">Sem setor</option>
          {setores.map((setor) => (
            <option key={setor.id} value={setor.id}>
              {setor.codigo} · {setor.nome}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
