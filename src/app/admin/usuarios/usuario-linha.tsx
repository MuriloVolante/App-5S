"use client";

import { useActionState } from "react";
import { atualizarUsuario, excluirUsuario } from "./actions";
import { ESTADO_INICIAL } from "@/lib/actions";
import { BOTAO_SEC, INPUT, TD } from "@/components/ui";
import type { AppUser, Setor } from "@/types";
import CamposPapelSetor from "./campos-papel-setor";

export default function UsuarioLinha({
  usuario,
  setores,
}: {
  usuario: AppUser;
  setores: Setor[];
}) {
  const [salvar, acaoSalvar, salvando] = useActionState(
    atualizarUsuario,
    ESTADO_INICIAL
  );
  const [excluir, acaoExcluir, excluindo] = useActionState(
    excluirUsuario,
    ESTADO_INICIAL
  );
  const erro = salvar.erro ?? excluir.erro;
  const formId = `usuario-${usuario.id}`;

  return (
    <tr>
      <td className={`${TD} font-mono text-neutral-500`}>{usuario.codigo}</td>
      <td className={TD}>
        <form action={acaoSalvar} id={formId} className="flex flex-wrap gap-2">
          <input type="hidden" name="id" value={usuario.id} />
          <input
            name="nome"
            defaultValue={usuario.nome}
            required
            className={`${INPUT} w-44`}
          />
          <CamposPapelSetor
            setores={setores}
            papelInicial={usuario.papel}
            setorInicial={usuario.setor_id ?? ""}
          />
        </form>
        {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
      </td>
      <td className={`${TD} text-neutral-500`}>{usuario.email}</td>
      <td className={TD}>
        <div className="flex gap-2">
          <button
            type="submit"
            form={formId}
            disabled={salvando}
            className={BOTAO_SEC}
          >
            Salvar
          </button>
          <form action={acaoExcluir}>
            <input type="hidden" name="id" value={usuario.id} />
            <button
              type="submit"
              disabled={excluindo}
              className={`${BOTAO_SEC} text-red-600`}
            >
              Excluir
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
