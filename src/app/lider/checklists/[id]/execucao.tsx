"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { BOTAO, BOTAO_SEC, INPUT } from "@/components/ui";
import type { ChecklistItem, ChecklistResposta } from "@/types";
import { finalizarChecklist, salvarResposta } from "./actions";

const BUCKET = "checklist-fotos";

export default function Execucao({
  checklistId,
  itens,
  respostas,
}: {
  checklistId: string;
  itens: ChecklistItem[];
  respostas: ChecklistResposta[];
}) {
  const router = useRouter();
  const [pendente, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [itemModal, setItemModal] = useState<ChecklistItem | null>(null);

  const porItem = new Map(respostas.map((r) => [r.item_id, r]));

  function marcarConforme(item: ChecklistItem) {
    setErro(null);
    startTransition(async () => {
      const { erro } = await salvarResposta({
        checklistId,
        itemId: item.id,
        conforme: true,
      });
      if (erro) setErro(erro);
      else router.refresh();
    });
  }

  function finalizar() {
    setErro(null);
    startTransition(async () => {
      const { erro } = await finalizarChecklist(checklistId);
      if (erro) setErro(erro);
      else router.refresh();
    });
  }

  async function registrarNaoConforme(
    item: ChecklistItem,
    observacao: string,
    arquivo: File
  ) {
    const supabase = createClient();
    const extensao = arquivo.name.split(".").pop() ?? "jpg";
    const caminho = `${checklistId}/${item.id}-${Date.now()}.${extensao}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(caminho, arquivo, { upsert: false });
    if (error) return error.message;

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(caminho);

    const resultado = await salvarResposta({
      checklistId,
      itemId: item.id,
      conforme: false,
      observacao,
      fotoUrl: publicUrl,
    });
    if (resultado.erro) return resultado.erro;

    router.refresh();
    return null;
  }

  const total = itens.length;
  const respondidos = itens.filter((item) => porItem.has(item.id)).length;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-neutral-500">
        {respondidos} de {total} itens respondidos
      </p>

      <ul className="flex flex-col gap-2">
        {itens.map((item) => {
          const resposta = porItem.get(item.id);
          return (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded border border-neutral-200 bg-white px-4 py-3"
            >
              <div className="text-sm">
                <span className="font-mono text-neutral-500">{item.codigo}</span>{" "}
                {item.descricao}
                {resposta && !resposta.conforme && (
                  <p className="mt-1 text-xs text-red-600">
                    {resposta.observacao}{" "}
                    {resposta.foto_url && (
                      <a
                        href={resposta.foto_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        foto
                      </a>
                    )}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {resposta && (
                  <span
                    className={`text-xs ${
                      resposta.conforme ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {resposta.conforme ? "Conforme" : "Nao conforme"}
                  </span>
                )}
                <button
                  type="button"
                  disabled={pendente}
                  onClick={() => marcarConforme(item)}
                  className={BOTAO_SEC}
                >
                  Conforme
                </button>
                <button
                  type="button"
                  disabled={pendente}
                  onClick={() => setItemModal(item)}
                  className={`${BOTAO_SEC} text-red-600`}
                >
                  Nao conforme
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      <div>
        <button
          type="button"
          onClick={finalizar}
          disabled={pendente}
          className={BOTAO}
        >
          Finalizar checklist
        </button>
      </div>

      {itemModal && (
        <ModalNaoConforme
          item={itemModal}
          aoFechar={() => setItemModal(null)}
          aoSalvar={registrarNaoConforme}
        />
      )}
    </div>
  );
}

function ModalNaoConforme({
  item,
  aoFechar,
  aoSalvar,
}: {
  item: ChecklistItem;
  aoFechar: () => void;
  aoSalvar: (
    item: ChecklistItem,
    observacao: string,
    arquivo: File
  ) => Promise<string | null>;
}) {
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function submeter(formData: FormData) {
    const observacao = String(formData.get("observacao") ?? "").trim();
    const arquivo = formData.get("foto");

    if (!observacao) return setErro("Descreva o problema.");
    if (!(arquivo instanceof File) || arquivo.size === 0)
      return setErro("Anexe a foto da nao conformidade.");

    setErro(null);
    setEnviando(true);
    const falha = await aoSalvar(item, observacao, arquivo);
    setEnviando(false);
    if (falha) setErro(falha);
    else aoFechar();
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
      <form
        action={submeter}
        className="flex w-full max-w-md flex-col gap-3 rounded-lg bg-white p-5"
      >
        <h2 className="text-sm font-semibold">
          Nao conformidade —{" "}
          <span className="font-mono text-neutral-500">{item.codigo}</span>
        </h2>
        <p className="text-sm text-neutral-600">{item.descricao}</p>
        <textarea
          name="observacao"
          required
          rows={3}
          placeholder="Descricao do problema"
          className={INPUT}
        />
        <input
          name="foto"
          type="file"
          accept="image/*"
          capture="environment"
          required
          className="text-sm"
        />
        {erro && <p className="text-xs text-red-600">{erro}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={aoFechar}
            disabled={enviando}
            className={BOTAO_SEC}
          >
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className={BOTAO}>
            {enviando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
