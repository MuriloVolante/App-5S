import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";
import Paginacao, { lerPagina } from "@/components/paginacao";
import { indicadoresAcoes, listarAcoesDoSetor } from "@/lib/repo";
import { ROTULO_STATUS_ACAO, type StatusAcao } from "@/types";
import AcaoLinha from "./acao-linha";
import { LINKS_EMBAIXADOR } from "../links";

const STATUS: StatusAcao[] = ["aberta", "com_prazo", "vencida", "concluida"];

export default async function AcoesDoSetorPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  const usuario = await requirePapel(["embaixador"]);
  const { pagina } = await searchParams;

  const acoes = await listarAcoesDoSetor(usuario.setor_id!, lerPagina(pagina));
  const indicadores = await indicadoresAcoes(usuario.setor_id);

  return (
    <>
      <Header
        usuario={usuario}
        links={LINKS_EMBAIXADOR}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-5 sm:py-8">
        <div>
          <h1 className="titulo">Ações do setor</h1>
          <p className="subtitulo mt-1">
            Ação aberta precisa de prazo para entrar em acompanhamento
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {STATUS.map((status) => (
            <div key={status} className="indicador">
              <p className="indicador-valor">
                {indicadores.porStatus[status]}
              </p>
              <p className="indicador-rotulo">{ROTULO_STATUS_ACAO[status]}</p>
            </div>
          ))}
        </div>

        <div className="tabela-rolagem">
        <table className="tabela">
          <thead>
            <tr>
              <th className="w-32">Código</th>
              <th className="w-24">Foto</th>
              <th>Problema</th>
              <th className="w-36">Status</th>
              <th className="w-64">Prazo</th>
              <th className="w-24">Resets</th>
            </tr>
          </thead>
          <tbody>
            {acoes.itens.map((acao) => (
              <AcaoLinha key={`${acao.id}:${acao.status}:${acao.prazo}`} acao={acao} />
            ))}
            {acoes.total === 0 && (
              <tr>
                <td colSpan={6} className="vazio">
                  Nenhuma acao no setor
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        <Paginacao
          base="/embaixador/acoes"
          pagina={acoes.pagina}
          paginas={acoes.paginas}
          total={acoes.total}
          rotulo="ações"
        />
      </main>
    </>
  );
}
