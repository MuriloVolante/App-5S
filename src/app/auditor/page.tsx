import Link from "next/link";
import Header from "@/components/header";
import Paginacao, { lerPagina } from "@/components/paginacao";
import { requirePapel } from "@/lib/auth";
import {
  contarAcoesVencidas,
  listarChecklistsPorStatus,
  obterTemplate,
} from "@/lib/repo";
import { ROTULO_STATUS_CHECKLIST } from "@/types";
import { LINKS_AUDITOR } from "./links";

export default async function AuditorPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string; finalizados?: string }>;
}) {
  const usuario = await requirePapel(["auditor"]);
  const { pagina, finalizados: paginaFinalizados } = await searchParams;

  const abertos = listarChecklistsPorStatus(
    usuario.setor_id!,
    "aberto",
    lerPagina(pagina)
  );
  const finalizados = listarChecklistsPorStatus(
    usuario.setor_id!,
    "finalizado",
    lerPagina(paginaFinalizados),
    10
  );
  const vencidas = contarAcoesVencidas(usuario.setor_id!);

  return (
    <>
      <Header usuario={usuario} links={LINKS_AUDITOR} />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-5 sm:py-8">
        {vencidas > 0 && (
          <Link href="/auditor/avaliacao" className="cartao barra-acao">
            <span className="subtitulo">
              {vencidas} ação(ões) vencida(s) aguardando avaliação
            </span>
            <span className="botao botao-laranja botao-mini">Avaliar</span>
          </Link>
        )}

        <section className="flex flex-col gap-3">
          <h1 className="titulo">Checklists a preencher</h1>
          {abertos.total === 0 ? (
            <p className="nota">
              Nenhum checklist aberto no seu setor. O embaixador do setor é quem
              abre novos checklists.
            </p>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {abertos.itens.map((checklist) => {
                  const template = obterTemplate(checklist.template_id);
                  return (
                    <li key={checklist.id}>
                      <Link
                        href={`/auditor/checklists/${checklist.id}`}
                        className="cartao-plano item-linha cartao-item"
                      >
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="break-words">
                            <span className="codigo">{checklist.codigo}</span>{" "}
                            {template?.nome}
                          </span>
                          <span className="nota">
                            aberto em{" "}
                            {new Date(checklist.data_criacao).toLocaleString(
                              "pt-BR"
                            )}
                          </span>
                        </span>
                        <span className="botao botao-mini w-full sm:w-auto">
                          Preencher
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <Paginacao
                base="/auditor"
                pagina={abertos.pagina}
                paginas={abertos.paginas}
                total={abertos.total}
                rotulo="abertos"
              />
            </>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="titulo">Finalizados</h2>
          {finalizados.total === 0 ? (
            <p className="nota">Nenhum checklist finalizado até agora.</p>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {finalizados.itens.map((checklist) => {
                  const template = obterTemplate(checklist.template_id);
                  return (
                    <li key={checklist.id}>
                      <Link
                        href={`/auditor/checklists/${checklist.id}`}
                        className="cartao-plano cartao-item"
                      >
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="break-words">
                            <span className="codigo">{checklist.codigo}</span>{" "}
                            {template?.nome}
                          </span>
                          <span className="nota">
                            {checklist.finalizado_em
                              ? new Date(
                                  checklist.finalizado_em
                                ).toLocaleString("pt-BR")
                              : ""}
                          </span>
                        </span>
                        <span className={`selo selo-${checklist.status}`}>
                          {ROTULO_STATUS_CHECKLIST[checklist.status]}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <Paginacao
                base="/auditor"
                pagina={finalizados.pagina}
                paginas={finalizados.paginas}
                total={finalizados.total}
                rotulo="finalizados"
                parametro="finalizados"
              />
            </>
          )}
        </section>
      </main>
    </>
  );
}
