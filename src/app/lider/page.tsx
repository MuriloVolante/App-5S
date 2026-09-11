import Link from "next/link";
import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";
import {
  listarAcoesVencidas,
  listarChecklistsDoLider,
  listarTemplatesDoSetor,
} from "@/lib/repo";
import { ROTULO_STATUS_CHECKLIST } from "@/types";
import CriarChecklist from "./criar-checklist";

const LINKS = [
  { href: "/lider", rotulo: "Checklists" },
  { href: "/lider/avaliacao", rotulo: "Ações vencidas" },
];

export default async function LiderPage() {
  const usuario = await requirePapel(["lider"]);
  const templates = listarTemplatesDoSetor(usuario.setor_id!);
  const checklists = listarChecklistsDoLider(usuario.id);
  const vencidas = listarAcoesVencidas(usuario.setor_id!).length;

  return (
    <>
      <Header usuario={usuario} links={LINKS} ativo="/lider" />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-5 sm:py-8">
        {vencidas > 0 && (
          <Link href="/lider/avaliacao" className="cartao barra-acao">
            <span className="subtitulo">
              {vencidas} ação(ões) vencida(s) aguardando avaliação
            </span>
            <span className="botao botao-laranja botao-mini">Avaliar</span>
          </Link>
        )}

        <section className="flex flex-col gap-3">
          <h1 className="titulo">Templates do meu setor</h1>
          {templates.length === 0 && (
            <p className="nota">
              Nenhum template cadastrado para o seu setor. Peça ao administrador.
            </p>
          )}
          <ul className="flex flex-col gap-2">
            {templates.map((template) => (
              <li key={template.id} className="cartao-plano cartao-item">
                <span className="break-words">
                  <span className="codigo">{template.codigo}</span>{" "}
                  {template.nome}
                </span>
                <CriarChecklist templateId={template.id} />
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="titulo">Meus checklists</h2>
          {checklists.length === 0 ? (
            <p className="nota">Nenhum checklist criado até agora.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {checklists.map((checklist) => (
                <li key={checklist.id}>
                  <Link
                    href={`/lider/checklists/${checklist.id}`}
                    className="cartao-plano cartao-item"
                  >
                    <span className="flex flex-col gap-1">
                      <span className="codigo">{checklist.codigo}</span>
                      <span className="nota">
                        {new Date(checklist.data_criacao).toLocaleString("pt-BR")}
                      </span>
                    </span>
                    <span className={`selo selo-${checklist.status}`}>
                      {ROTULO_STATUS_CHECKLIST[checklist.status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
