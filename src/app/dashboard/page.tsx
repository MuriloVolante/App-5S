import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";
import { listarAcoes, listarSetores } from "@/lib/repo";
import {
  HOME_POR_PAPEL,
  ROTULO_STATUS_ACAO,
  type StatusAcao,
} from "@/types";

const STATUS: StatusAcao[] = ["aberta", "com_prazo", "vencida", "concluida"];
const DIA_MS = 1000 * 60 * 60 * 24;

export default async function DashboardPage() {
  const usuario = await requirePapel(["coordenador", "admin"]);
  const escopo = usuario.papel === "admin" ? null : usuario.setor_id;
  const acoes = listarAcoes(escopo);
  const setores = listarSetores().filter(
    (setor) => !escopo || setor.id === escopo
  );

  const nomeSetor = new Map(
    setores.map((setor) => [setor.id, `${setor.codigo} · ${setor.nome}`])
  );

  const comAcoes = setores.filter((setor) =>
    acoes.some((acao) => acao.setor_id === setor.id)
  );

  const vencidas = acoes.filter((acao) => acao.status === "vencida");
  const recorrentes = acoes.filter((acao) => acao.reset_count > 0);
  const concluidas = acoes.filter((acao) => acao.status === "concluida");

  const mediaGeral = media(
    concluidas.map(
      (acao) =>
        (new Date(acao.concluido_em!).getTime() -
          new Date(acao.aberto_em).getTime()) /
        DIA_MS
    )
  );

  const links =
    usuario.papel === "admin"
      ? [
          { href: "/admin/setores", rotulo: "Setores" },
          { href: "/admin/usuarios", rotulo: "Usuarios" },
          { href: "/admin/templates", rotulo: "Templates" },
          { href: "/dashboard", rotulo: "Dashboard" },
        ]
      : [
          { href: "/coordenador", rotulo: "Acoes do setor" },
          { href: "/dashboard", rotulo: "Dashboard" },
        ];

  return (
    <>
      <Header usuario={usuario} links={links} ativo="/dashboard" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8">
        <div>
          <h1 className="titulo">Dashboard</h1>
          <p className="subtitulo mt-1">
            {usuario.papel === "admin"
              ? "Todos os setores"
              : nomeSetor.get(usuario.setor_id ?? "") ?? "Seu setor"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Indicador valor={acoes.length} rotulo="Acoes totais" />
          <Indicador valor={vencidas.length} rotulo="Vencidas" />
          <Indicador valor={recorrentes.length} rotulo="Com reincidencia" />
          <Indicador
            valor={mediaGeral === null ? "—" : mediaGeral.toFixed(1)}
            rotulo="Dias ate concluir"
          />
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="subtitulo">Acoes por status e setor</h2>
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
              {comAcoes.map((setor) => (
                <tr key={setor.id}>
                  <td>{nomeSetor.get(setor.id)}</td>
                  {STATUS.map((status) => (
                    <td key={status}>
                      {
                        acoes.filter(
                          (acao) =>
                            acao.setor_id === setor.id && acao.status === status
                        ).length
                      }
                    </td>
                  ))}
                  <td>
                    {acoes.filter((acao) => acao.setor_id === setor.id).length}
                  </td>
                </tr>
              ))}
              {comAcoes.length === 0 && (
                <tr>
                  <td colSpan={6} className="vazio">
                    Nenhuma acao registrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="subtitulo">Acoes vencidas ({vencidas.length})</h2>
          <table className="tabela">
            <thead>
              <tr>
                <th className="w-32">Codigo</th>
                <th>Problema</th>
                <th className="w-56">Setor</th>
                <th className="w-32">Prazo</th>
                <th className="w-24">Resets</th>
              </tr>
            </thead>
            <tbody>
              {vencidas.map((acao) => (
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
              {vencidas.length === 0 && (
                <tr>
                  <td colSpan={5} className="vazio">
                    Nenhuma acao vencida
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="subtitulo">
            Reincidencia · acoes resetadas ({recorrentes.length})
          </h2>
          <table className="tabela">
            <thead>
              <tr>
                <th className="w-32">Codigo</th>
                <th>Problema</th>
                <th className="w-56">Setor</th>
                <th className="w-36">Status</th>
                <th className="w-24">Resets</th>
              </tr>
            </thead>
            <tbody>
              {recorrentes.map((acao) => (
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
              {recorrentes.length === 0 && (
                <tr>
                  <td colSpan={5} className="vazio">
                    Nenhuma acao resetada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="subtitulo">Tempo medio de resolucao por setor</h2>
          <table className="tabela">
            <thead>
              <tr>
                <th>Setor</th>
                <th className="w-36">Concluidas</th>
                <th className="w-40">Media (dias)</th>
              </tr>
            </thead>
            <tbody>
              {comAcoes.map((setor) => {
                const doSetor = concluidas.filter(
                  (acao) => acao.setor_id === setor.id && acao.concluido_em
                );
                const valor = media(
                  doSetor.map(
                    (acao) =>
                      (new Date(acao.concluido_em!).getTime() -
                        new Date(acao.aberto_em).getTime()) /
                      DIA_MS
                  )
                );
                return (
                  <tr key={setor.id}>
                    <td>{nomeSetor.get(setor.id)}</td>
                    <td>{doSetor.length}</td>
                    <td>{valor === null ? "—" : valor.toFixed(1)}</td>
                  </tr>
                );
              })}
              {comAcoes.length === 0 && (
                <tr>
                  <td colSpan={3} className="vazio">
                    Sem dados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

function media(valores: number[]) {
  if (valores.length === 0) return null;
  return valores.reduce((soma, valor) => soma + valor, 0) / valores.length;
}
