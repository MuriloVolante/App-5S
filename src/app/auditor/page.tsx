import Link from "next/link";
import Header from "@/components/header";
import Paginacao, { lerPagina } from "@/components/paginacao";
import { requirePapel } from "@/lib/auth";
import {
  contarAcoesVencidasGlobais,
  contarItens,
  listarChecklistsGlobaisPorStatus,
  listarSetores,
  listarTemplatesComSetor,
  obterTemplate,
} from "@/lib/repo";
import { ROTULO_STATUS_CHECKLIST } from "@/types";
import AbrirChecklist from "./abrir-checklist";
import { LINKS_AUDITOR } from "./links";

export default async function AuditorPage({
  searchParams,
}: {
  searchParams: Promise<{
    templates?: string;
    abertos?: string;
    finalizados?: string;
  }>;
}) {
  const usuario = await requirePapel(["auditor"]);
  const {
    templates: paginaTemplates,
    abertos: paginaAbertos,
    finalizados: paginaFinalizados,
  } = await searchParams;

  const templates = listarTemplatesComSetor(lerPagina(paginaTemplates));
  const abertos = listarChecklistsGlobaisPorStatus(
    "aberto",
    lerPagina(paginaAbertos)
  );
  const finalizados = listarChecklistsGlobaisPorStatus(
    "finalizado",
    lerPagina(paginaFinalizados),
    10
  );
  const vencidas = contarAcoesVencidasGlobais();

  const nomeSetor = new Map(
    listarSetores().map((setor) => [setor.id, `${setor.codigo} · ${setor.nome}`])
  );

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

        {abertos.total > 0 && (
          <section className="flex flex-col gap-3">
            <h1 className="titulo">Auditorias em andamento</h1>
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
                          {nomeSetor.get(checklist.setor_id)} · aberta em{" "}
                          {new Date(checklist.data_criacao).toLocaleString(
                            "pt-BR"
                          )}
                        </span>
                      </span>
                      <span className="botao botao-mini w-full sm:w-auto">
                        Continuar
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
              rotulo="em andamento"
              parametro="abertos"
            />
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="titulo">Abrir auditoria</h2>
          <p className="subtitulo">
            Checklists definidos pelo embaixador de cada setor
          </p>
          {templates.total === 0 ? (
            <p className="nota">
              Nenhum checklist cadastrado ainda. Os embaixadores criam os
              checklists dos seus setores.
            </p>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {templates.itens.map((template) => {
                  const itens = contarItens(template.id);
                  return (
                    <li key={template.id} className="cartao-plano cartao-item">
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="break-words">
                          <span className="codigo">{template.codigo}</span>{" "}
                          {template.nome}
                        </span>
                        <span className="nota">
                          {template.setor_codigo} · {template.setor_nome} ·{" "}
                          {itens} itens
                        </span>
                      </span>
                      <AbrirChecklist
                        templateId={template.id}
                        desabilitado={itens === 0}
                      />
                    </li>
                  );
                })}
              </ul>

              <Paginacao
                base="/auditor"
                pagina={templates.pagina}
                paginas={templates.paginas}
                total={templates.total}
                rotulo="checklists"
                parametro="templates"
              />
            </>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="titulo">Auditorias finalizadas</h2>
          {finalizados.total === 0 ? (
            <p className="nota">Nenhuma auditoria finalizada até agora.</p>
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
                            {nomeSetor.get(checklist.setor_id)} ·{" "}
                            {checklist.finalizado_em
                              ? new Date(checklist.finalizado_em).toLocaleString(
                                  "pt-BR"
                                )
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
                rotulo="finalizadas"
                parametro="finalizados"
              />
            </>
          )}
        </section>
      </main>
    </>
  );
}
