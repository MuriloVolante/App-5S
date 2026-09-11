"use client";

import { useActionState, useEffect, useState } from "react";
import Foto from "@/components/foto";
import { ESTADO_INICIAL } from "@/lib/actions";
import type { ChecklistItem, ChecklistResposta } from "@/types";
import { finalizar, marcarConforme, registrarNaoConforme } from "./actions";

export default function Execucao({
  checklistId,
  itens,
  respostas,
}: {
  checklistId: string;
  itens: ChecklistItem[];
  respostas: ChecklistResposta[];
}) {
  const [itemModal, setItemModal] = useState<ChecklistItem | null>(null);
  const [conforme, acaoConforme] = useActionState(
    marcarConforme,
    ESTADO_INICIAL
  );
  const [final, acaoFinal, finalizando] = useActionState(
    finalizar,
    ESTADO_INICIAL
  );

  const porItem = new Map(
    respostas.map((resposta) => [resposta.item_id, resposta])
  );
  const respondidos = itens.filter((item) => porItem.has(item.id)).length;
  const erro = conforme.erro ?? final.erro;

  return (
    <div className="flex flex-col gap-4">
      <div className="cartao-plano barra-acao">
        <span className="subtitulo">
          {respondidos} de {itens.length} itens respondidos
        </span>
        <form action={acaoFinal} className="w-full sm:w-auto">
          <input type="hidden" name="checklist_id" value={checklistId} />
          <button
            type="submit"
            disabled={finalizando}
            className="botao botao-laranja w-full"
          >
            Finalizar checklist
          </button>
        </form>
      </div>

      {erro && <p className="erro">{erro}</p>}

      <ul className="flex flex-col gap-2">
        {itens.map((item) => {
          const resposta = porItem.get(item.id);
          return (
            <li
              key={item.id}
              className={`cartao-plano item-linha cartao-item ${
                resposta
                  ? resposta.conforme
                    ? "item-conforme"
                    : "item-nao-conforme"
                  : ""
              }`}
            >
              <div className="flex min-w-0 flex-1 gap-3">
                {resposta && !resposta.conforme && resposta.foto_url && (
                  <Foto
                    url={resposta.foto_url}
                    legenda={`${item.codigo} · ${item.descricao}`}
                  />
                )}
                <div className="min-w-0">
                  <p className="break-words">
                    <span className="codigo">{item.codigo}</span>{" "}
                    {item.descricao}
                  </p>
                  {resposta && !resposta.conforme && (
                    <p className="nota mt-1 break-words">
                      {resposta.observacao}
                    </p>
                  )}
                </div>
              </div>

              <div className="cartao-item-acoes">
                <form action={acaoConforme}>
                  <input type="hidden" name="checklist_id" value={checklistId} />
                  <input type="hidden" name="item_id" value={item.id} />
                  <button
                    type="submit"
                    className={`botao botao-secundario botao-mini ${
                      resposta?.conforme ? "botao-conforme-ativo" : ""
                    }`}
                  >
                    Conforme
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => setItemModal(item)}
                  className={`botao botao-perigo botao-mini ${
                    resposta && !resposta.conforme
                      ? "botao-nao-conforme-ativo"
                      : ""
                  }`}
                >
                  Não conforme
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {itemModal && (
        <ModalNaoConforme
          checklistId={checklistId}
          item={itemModal}
          aoFechar={() => setItemModal(null)}
        />
      )}
    </div>
  );
}

function ModalNaoConforme({
  checklistId,
  item,
  aoFechar,
}: {
  checklistId: string;
  item: ChecklistItem;
  aoFechar: () => void;
}) {
  const [state, action, enviando] = useActionState(
    registrarNaoConforme,
    ESTADO_INICIAL
  );

  useEffect(() => {
    if (state.ok) aoFechar();
  }, [state, aoFechar]);

  return (
    <div className="modal-fundo">
      <form action={action} className="cartao w-full max-w-md p-4 sm:p-5">
        <p className="subtitulo">Não conformidade</p>
        <h2 className="titulo mt-1">
          <span className="codigo">{item.codigo}</span>
        </h2>
        <p className="nota mt-2 break-words">{item.descricao}</p>

        <input type="hidden" name="checklist_id" value={checklistId} />
        <input type="hidden" name="item_id" value={item.id} />

        <div className="mt-4">
          <label className="rotulo" htmlFor="observacao">
            Descrição do problema
          </label>
          <textarea
            id="observacao"
            name="observacao"
            rows={3}
            required
            className="campo"
          />
        </div>

        <div className="mt-4">
          <label className="rotulo" htmlFor="foto">
            Foto (obrigatória)
          </label>
          <input
            id="foto"
            name="foto"
            type="file"
            accept="image/*"
            capture="environment"
            required
            className="campo"
          />
        </div>

        {state.erro && <p className="erro mt-3">{state.erro}</p>}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={aoFechar}
            disabled={enviando}
            className="botao botao-secundario"
          >
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className="botao">
            {enviando ? "Salvando" : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
