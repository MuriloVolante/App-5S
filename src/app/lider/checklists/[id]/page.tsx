import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";
import {
  listarItens,
  obterChecklist,
  obterTemplate,
  respostasDoChecklist,
} from "@/lib/repo";
import Execucao from "./execucao";

const LINKS = [
  { href: "/lider", rotulo: "Checklists" },
  { href: "/lider/avaliacao", rotulo: "Acoes vencidas" },
];

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await requirePapel(["lider"]);

  const checklist = obterChecklist(id);
  if (!checklist) notFound();
  if (checklist.lider_id !== usuario.id) redirect("/lider");

  const template = obterTemplate(checklist.template_id);
  const itens = listarItens(checklist.template_id);
  const respostas = respostasDoChecklist(checklist.id);

  return (
    <>
      <Header usuario={usuario} links={LINKS} ativo="/lider" />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-8">
        <div>
          <Link href="/lider" className="link-voltar">
            &larr; Meus checklists
          </Link>
          <h1 className="titulo mt-2">
            <span className="codigo">{checklist.codigo}</span> {template?.nome}
          </h1>
          <p className="subtitulo mt-1">
            {template?.codigo} ·{" "}
            <span className={`selo selo-${checklist.status}`}>
              {checklist.status}
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
              const resposta = respostas.find((atual) => atual.item_id === item.id);
              return (
                <li
                  key={item.id}
                  className={`cartao-plano item-linha flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
                    resposta?.conforme ? "item-conforme" : "item-nao-conforme"
                  }`}
                >
                  <div className="min-w-[220px] flex-1">
                    <p>
                      <span className="codigo">{item.codigo}</span>{" "}
                      {item.descricao}
                    </p>
                    {resposta && !resposta.conforme && (
                      <p className="nota mt-1">
                        {resposta.observacao} ·{" "}
                        {resposta.foto_url && (
                          <a
                            href={resposta.foto_url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            ver foto
                          </a>
                        )}
                      </p>
                    )}
                  </div>
                  <span
                    className={`selo ${
                      resposta?.conforme ? "selo-conforme" : "selo-nao-conforme"
                    }`}
                  >
                    {resposta?.conforme ? "Conforme" : "Nao conforme"}
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
