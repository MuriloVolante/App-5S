import Link from "next/link";
import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";
import {
  listarAcoesVencidas,
  listarChecklistsDoLider,
  listarTemplatesDoSetor,
} from "@/lib/repo";
import CriarChecklist from "./criar-checklist";

const LINKS = [
  { href: "/lider", rotulo: "Checklists" },
  { href: "/lider/avaliacao", rotulo: "Acoes vencidas" },
];

export default async function LiderPage() {
  const usuario = await requirePapel(["lider"]);
  const templates = listarTemplatesDoSetor(usuario.setor_id!);
  const checklists = listarChecklistsDoLider(usuario.id);
  const vencidas = listarAcoesVencidas(usuario.setor_id!).length;

  return (
    <>
      <Header usuario={usuario} links={LINKS} ativo="/lider" />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-8">
        {vencidas > 0 && (
          <Link
            href="/lider/avaliacao"
            className="cartao flex items-center justify-between px-4 py-3"
          >
            <span className="subtitulo">
              {vencidas} acao(oes) vencida(s) aguardando avaliacao
            </span>
            <span className="botao botao-laranja botao-mini">Avaliar</span>
          </Link>
        )}

        <section className="flex flex-col gap-3">
          <h1 className="titulo">Templates do meu setor</h1>
          {templates.length === 0 && (
            <p className="nota">
              Nenhum template cadastrado para o seu setor. Peca ao administrador.
            </p>
          )}
          <ul className="flex flex-col gap-2">
            {templates.map((template) => (
              <li
                key={template.id}
                className="cartao-plano flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <span>
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
            <p className="nota">Nenhum checklist criado ate agora.</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th className="w-32">Codigo</th>
                  <th>Criado em</th>
                  <th className="w-40">Status</th>
                </tr>
              </thead>
              <tbody>
                {checklists.map((checklist) => (
                  <tr key={checklist.id}>
                    <td>
                      <Link
                        href={`/lider/checklists/${checklist.id}`}
                        className="codigo underline"
                      >
                        {checklist.codigo}
                      </Link>
                    </td>
                    <td>
                      {new Date(checklist.data_criacao).toLocaleString("pt-BR")}
                    </td>
                    <td>
                      <span className={`selo selo-${checklist.status}`}>
                        {checklist.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </>
  );
}
