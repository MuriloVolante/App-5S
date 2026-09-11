"use client";

import { useActionState } from "react";
import { ESTADO_INICIAL } from "@/lib/actions";
import { useAtualizarAposAcao } from "@/lib/atualizar";
import type { AppUser, Setor } from "@/types";
import CamposPapelSetor from "./campos-papel-setor";
import { atualizarUsuario, excluirUsuario } from "./actions";

export default function UsuarioLinha({
  usuario,
  setores,
}: {
  usuario: AppUser;
  setores: Setor[];
}) {
  const [salvo, salvar, salvando] = useActionState(
    atualizarUsuario,
    ESTADO_INICIAL
  );
  const [removido, remover, removendo] = useActionState(
    excluirUsuario,
    ESTADO_INICIAL
  );
  useAtualizarAposAcao(salvo);
  useAtualizarAposAcao(removido);
  const erro = salvo.erro ?? removido.erro;
  const formId = `usuario-${usuario.id}`;

  return (
    <tr>
      <td className="codigo align-top">{usuario.codigo}</td>
      <td>
        <form action={salvar} id={formId} className="flex flex-wrap gap-3">
          <input type="hidden" name="id" value={usuario.id} />
          <div className="min-w-[160px] flex-1">
            <label className="rotulo">Nome</label>
            <input
              name="nome"
              defaultValue={usuario.nome}
              required
              className="campo"
            />
          </div>
          <CamposPapelSetor
            setores={setores}
            papelInicial={usuario.papel}
            setorInicial={usuario.setor_id ?? ""}
          />
        </form>
        {erro && <p className="erro mt-1">{erro}</p>}
      </td>
      <td className="align-top text-[11px]">{usuario.email}</td>
      <td className="align-top">
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            form={formId}
            disabled={salvando}
            className="botao botao-secundario botao-mini"
          >
            Salvar
          </button>
          <form action={remover}>
            <input type="hidden" name="id" value={usuario.id} />
            <button
              type="submit"
              disabled={removendo}
              className="botao botao-perigo botao-mini"
            >
              Excluir
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
