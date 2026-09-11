import Header from "@/components/header";
import Paginacao, { lerPagina } from "@/components/paginacao";
import { requirePapel } from "@/lib/auth";
import { listarAcoesVencidasGlobais, listarSetores } from "@/lib/repo";
import AcaoVencida from "./acao-vencida";
import { LINKS_AUDITOR } from "../links";

export default async function AvaliacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const usuario = await requirePapel(["auditor"]);
  const { pagina } = await searchParams;
  const acoes = listarAcoesVencidasGlobais(lerPagina(pagina));
  const nomeSetor = new Map(
    listarSetores().map((setor) => [setor.id, `${setor.codigo} · ${setor.nome}`])
  );

  return (
    <>
      <Header usuario={usuario} links={LINKS_AUDITOR} />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-5 sm:py-8">
        <div>
          <h1 className="titulo">Avaliação de ações vencidas</h1>
          <p className="subtitulo mt-1">
            Concluir encerra a ação · Resetar devolve ao embaixador do setor para novo
            prazo
          </p>
        </div>

        {acoes.total === 0 ? (
          <p className="cartao-plano vazio">Nenhuma ação vencida</p>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {acoes.itens.map((acao) => (
                <AcaoVencida
                  key={`${acao.id}:${acao.status}:${acao.reset_count}`}
                  acao={acao}
                  setor={nomeSetor.get(acao.setor_id) ?? ""}
                />
              ))}
            </ul>

            <Paginacao
              base="/auditor/avaliacao"
              pagina={acoes.pagina}
              paginas={acoes.paginas}
              total={acoes.total}
              rotulo="ações vencidas"
            />
          </>
        )}
      </main>
    </>
  );
}
