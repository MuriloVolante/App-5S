import Link from "next/link";
import { notFound } from "next/navigation";
import Foto from "@/components/foto";
import Header from "@/components/header";
import { LINKS_AUDITOR } from "../../links";
import { requirePapel } from "@/lib/auth";
import {
  listarItens,
  obterChecklist,
  obterTemplate,
  respostasDoChecklist,
} from "@/lib/repo";
import { ROTULO_STATUS_CHECKLIST } from "@/types";
import Execucao from "./execucao";



export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await requirePapel(["auditor"]);

  const checklist = obterChecklist(id);
  if (!checklist) notFound();

  const template = obterTemplate(checklist.template_id);
  const itens = listarItens(checklist.template_id);
  const respostas = respostasDoChecklist(checklist.id);

  return (
    <>
      <Header usuario={usuario} links={LINKS_AUDITOR} />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-5 sm:py-8">
        <div>
          <Link href="/auditor" className="link-voltar">
            &larr; Auditorias
          </Link>
          <h1 className="titulo mt-2 break-words">
            <span className="codigo">{checklist.codigo}</span> {template?.nome}
          </h1>
          <p className="subtitulo mt-1">
            {template?.codigo} ·{" "}
            <span className={`selo selo-${checklist.status}`}>
              {ROTULO_STATUS_CHECKLIST[checklist.status]}
            </span>
          </p>
        </div>

        {checklist.status === "aberto" ? (
          <Execucao
            checklistId={checklist.id}
            itens={itens}
            respostas={respostas}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {itens.map((item) => {
              const resposta = respostas.find(
                (atual) => atual.item_id === item.id
              );
              return (
                <li
                  key={item.id}
                  className={`cartao-plano item-linha cartao-item ${
                    resposta?.conforme ? "item-conforme" : "item-nao-conforme"
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
                  <span
                    className={`selo ${
                      resposta?.conforme ? "selo-conforme" : "selo-nao-conforme"
                    }`}
                  >
                    {resposta?.conforme ? "Conforme" : "Não conforme"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
