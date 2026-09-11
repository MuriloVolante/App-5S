import Header from "@/components/header";
import Paginacao, { lerPagina } from "@/components/paginacao";
import { requirePapel } from "@/lib/auth";
import {
  indicadoresAcoes,
  listarAcoesPorStatus,
  listarAcoesReincidentes,
  listarSetores,
  resumoAcoesPorSetor,
  tempoMedioPorSetor,
} from "@/lib/repo";
import { ROTULO_STATUS_ACAO, type StatusAcao } from "@/types";

const STATUS: StatusAcao[] = ["aberta", "com_prazo", "vencida", "concluida"];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    vencidas?: string;
    reincidentes?: string;
    setores?: string;
    medias?: string;
  }>;
}) {
  const usuario = await requirePapel(["embaixador", "admin"]);
  const {
    vencidas: paginaVencidas,
    reincidentes: paginaReincidentes,
    setores: paginaSetores,
    medias: paginaMedias,
  } = await searchParams;

  const escopo = usuario.papel === "admin" ? null : usuario.setor_id;

  const indicadores = indicadoresAcoes(escopo);
  const resumo = resumoAcoesPorSetor(escopo, lerPagina(paginaSetores));
  const medias = tempoMedioPorSetor(escopo, lerPagina(paginaMedias));
  const vencidas = listarAcoesPorStatus(
    "vencida",
    escopo,
    lerPagina(paginaVencidas)
  );
  const reincidentes = listarAcoesReincidentes(
    escopo,
    lerPagina(paginaReincidentes)
  );

  const nomeSetor = new Map(
    listarSetores().map((setor) => [setor.id, `${setor.codigo} · ${setor.nome}`])
  );

  const links =
    usuario.papel === "admin"
      ? [
          { href: "/admin/setores", rotulo: "Setores" },
          { href: "/admin/usuarios", rotulo: "Usuários" },
          { href: "/admin/templates", rotulo: "Templates" },
          { href: "/dashboard", rotulo: "Dashboard" },
        ]
      : [
          { href: "/embaixador", rotulo: "Checklists" },
          { href: "/embaixador/acoes", rotulo: "Ações do setor" },
          { href: "/dashboard", rotulo: "Dashboard" },
        ];

  return (
    <>
      <Header usuario={usuario} links={links} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-5 sm:py-8">
        <div>
          <h1 className="titulo">Dashboard</h1>
          <p className="subtitulo mt-1">
            {usuario.papel === "admin"
              ? "Todos os setores"
              : nomeSetor.get(usuario.setor_id ?? "") ?? "Seu setor"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Indicador valor={indicadores.total} rotulo="Ações totais" />
          <Indicador valor={indicadores.vencidas} rotulo="Vencidas" />
          <Indicador
            valor={indicadores.reincidentes}
            rotulo="Com reincidência"
          />
          <Indicador
            valor={
              indicadores.mediaDias === null
                ? "—"
                : indicadores.mediaDias.toFixed(1)
            }
            rotulo="Dias até concluir"
          />
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="subtitulo">Ações por status e setor</h2>
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Setor</th>
                  {STATUS.map((status) => (
                    <th key={status} className="w-28">
                      {ROTULO_STATUS_ACAO[status]}
                    </th>
                  ))}
                  <th className="w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {resumo.itens.map((linha) => (
                  <tr key={linha.setor_id}>
                    <td>{nomeSetor.get(linha.setor_id) ?? linha.setor_id}</td>
                    {STATUS.map((status) => (
                      <td key={status}>{linha[status]}</td>
                    ))}
                    <td>{linha.total}</td>
                  </tr>
                ))}
                {resumo.total === 0 ? (
                  <tr>
                    <td colSpan={6} className="vazio">
                      Nenhuma ação registrada
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td className="font-bold">Total geral</td>
                    {STATUS.map((status) => (
                      <td key={status} className="font-bold">
                        {indicadores.porStatus[status]}
                      </td>
                    ))}
                    <td className="font-bold">{indicadores.total}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Paginacao
            base="/dashboard"
            pagina={resumo.pagina}
            paginas={resumo.paginas}
            total={resumo.total}
            rotulo="setores com ações"
            parametro="setores"
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="subtitulo">Ações vencidas ({vencidas.total})</h2>
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th className="w-32">Código</th>
                  <th>Problema</th>
                  <th className="w-56">Setor</th>
                  <th className="w-32">Prazo</th>
                  <th className="w-24">Resets</th>
                </tr>
              </thead>
              <tbody>
                {vencidas.itens.map((acao) => (
                  <tr key={acao.id}>
                    <td className="codigo">{acao.codigo}</td>
                    <td>{acao.descricao_problema}</td>
                    <td>{nomeSetor.get(acao.setor_id)}</td>
                    <td>
                      {acao.prazo
                        ? new Date(`${acao.prazo}T00:00:00`).toLocaleDateString(
                            "pt-BR"
                          )
                        : "—"}
                    </td>
                    <td>{acao.reset_count}</td>
                  </tr>
                ))}
                {vencidas.total === 0 && (
                  <tr>
                    <td colSpan={5} className="vazio">
                      Nenhuma ação vencida
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Paginacao
            base="/dashboard"
            pagina={vencidas.pagina}
            paginas={vencidas.paginas}
            total={vencidas.total}
            rotulo="vencidas"
            parametro="vencidas"
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="subtitulo">
            Reincidência · ações resetadas ({reincidentes.total})
          </h2>
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th className="w-32">Código</th>
                  <th>Problema</th>
                  <th className="w-56">Setor</th>
                  <th className="w-36">Status</th>
                  <th className="w-24">Resets</th>
                </tr>
              </thead>
              <tbody>
                {reincidentes.itens.map((acao) => (
                  <tr key={acao.id}>
                    <td className="codigo">{acao.codigo}</td>
                    <td>{acao.descricao_problema}</td>
                    <td>{nomeSetor.get(acao.setor_id)}</td>
                    <td>
                      <span className={`selo selo-${acao.status}`}>
                        {ROTULO_STATUS_ACAO[acao.status]}
                      </span>
                    </td>
                    <td>{acao.reset_count}</td>
                  </tr>
                ))}
                {reincidentes.total === 0 && (
                  <tr>
                    <td colSpan={5} className="vazio">
                      Nenhuma ação resetada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Paginacao
            base="/dashboard"
            pagina={reincidentes.pagina}
            paginas={reincidentes.paginas}
            total={reincidentes.total}
            rotulo="reincidentes"
            parametro="reincidentes"
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="subtitulo">Tempo médio de resolução por setor</h2>
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Setor</th>
                  <th className="w-36">Concluídas</th>
                  <th className="w-40">Média (dias)</th>
                </tr>
              </thead>
              <tbody>
                {medias.itens.map((linha) => (
                  <tr key={linha.setor_id}>
                    <td>{nomeSetor.get(linha.setor_id) ?? linha.setor_id}</td>
                    <td>{linha.total}</td>
                    <td>
                      {linha.media_dias === null
                        ? "—"
                        : linha.media_dias.toFixed(1)}
                    </td>
                  </tr>
                ))}
                {medias.total === 0 && (
                  <tr>
                    <td colSpan={3} className="vazio">
                      Sem dados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Paginacao
            base="/dashboard"
            pagina={medias.pagina}
            paginas={medias.paginas}
            total={medias.total}
            rotulo="setores com conclusões"
            parametro="medias"
          />
        </section>
      </main>
    </>
  );
}

function Indicador({
  valor,
  rotulo,
}: {
  valor: number | string;
  rotulo: string;
}) {
  return (
    <div className="indicador">
      <p className="indicador-valor">{valor}</p>
      <p className="indicador-rotulo">{rotulo}</p>
    </div>
  );
}
