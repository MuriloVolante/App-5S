import Link from "next/link";
import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { aplicarVencimentos } from "@/lib/vencimentos";
import { TABELA, TD, TH } from "@/components/ui";
import { HOME_POR_PAPEL, type Acao, type Setor, type StatusAcao } from "@/types";

const STATUS: StatusAcao[] = ["aberta", "com_prazo", "vencida", "concluida"];

const DIA_MS = 1000 * 60 * 60 * 24;

export default async function DashboardPage() {
  const usuario = await requirePapel(["coordenador", "admin"]);
  await aplicarVencimentos();

  const supabase = await createClient();
  const [{ data: acoesData }, { data: setoresData }] = await Promise.all([
    supabase
      .from("acoes")
      .select(
        "id, codigo, resposta_id, setor_id, descricao_problema, foto_url, aberto_por, aberto_em, prazo, status, reset_count, concluido_em, concluido_por"
      ),
    supabase.from("setores").select("id, codigo, nome, created_at").order("codigo"),
  ]);

  const acoes = (acoesData ?? []) as Acao[];
  const setores = (setoresData ?? []) as Setor[];
  const nomeSetor = new Map(
    setores.map((setor) => [setor.id, `${setor.codigo} — ${setor.nome}`])
  );

  const setoresComAcoes = setores.filter((setor) =>
    acoes.some((acao) => acao.setor_id === setor.id)
  );

  const contar = (setorId: string, status: StatusAcao) =>
    acoes.filter((acao) => acao.setor_id === setorId && acao.status === status)
      .length;

  const vencidas = acoes
    .filter((acao) => acao.status === "vencida")
    .sort((a, b) => (a.prazo ?? "").localeCompare(b.prazo ?? ""));

  const recorrentes = acoes.filter((acao) => acao.reset_count > 0);

  const tempoMedio = setoresComAcoes.map((setor) => {
    const concluidas = acoes.filter(
      (acao) =>
        acao.setor_id === setor.id &&
        acao.status === "concluida" &&
        acao.concluido_em
    );
    const dias = concluidas.map(
      (acao) =>
        (new Date(acao.concluido_em!).getTime() -
          new Date(acao.aberto_em).getTime()) /
        DIA_MS
    );
    const media = dias.length
      ? dias.reduce((soma, valor) => soma + valor, 0) / dias.length
      : null;
    return { setor, total: concluidas.length, media };
  });

  return (
    <>
      <Header usuario={usuario} />
      <main className="flex flex-col gap-8 p-6">
        <div>
          <Link
            href={HOME_POR_PAPEL[usuario.papel]}
            className="text-sm text-neutral-500"
          >
            &larr; Voltar
          </Link>
          <h1 className="mt-1 text-lg font-semibold">Dashboard</h1>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Acoes por status e setor</h2>
          <table className={TABELA}>
            <thead>
              <tr>
                <th className={TH}>Setor</th>
                {STATUS.map((status) => (
                  <th key={status} className={TH}>
                    {status}
                  </th>
                ))}
                <th className={TH}>Total</th>
              </tr>
            </thead>
            <tbody>
              {setoresComAcoes.map((setor) => (
                <tr key={setor.id}>
                  <td className={TD}>{nomeSetor.get(setor.id)}</td>
                  {STATUS.map((status) => (
                    <td key={status} className={TD}>
                      {contar(setor.id, status)}
                    </td>
                  ))}
                  <td className={TD}>
                    {acoes.filter((acao) => acao.setor_id === setor.id).length}
                  </td>
                </tr>
              ))}
              <tr>
                <td className={`${TD} font-medium`}>Total</td>
                {STATUS.map((status) => (
                  <td key={status} className={`${TD} font-medium`}>
                    {acoes.filter((acao) => acao.status === status).length}
                  </td>
                ))}
                <td className={`${TD} font-medium`}>{acoes.length}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">
            Acoes vencidas ({vencidas.length})
          </h2>
          <table className={TABELA}>
            <thead>
              <tr>
                <th className={TH}>Codigo</th>
                <th className={TH}>Setor</th>
                <th className={TH}>Problema</th>
                <th className={TH}>Prazo</th>
                <th className={TH}>Resets</th>
              </tr>
            </thead>
            <tbody>
              {vencidas.map((acao) => (
                <tr key={acao.id}>
                  <td className={`${TD} font-mono text-neutral-500`}>
                    {acao.codigo}
                  </td>
                  <td className={TD}>{nomeSetor.get(acao.setor_id)}</td>
                  <td className={TD}>{acao.descricao_problema}</td>
                  <td className={TD}>
                    {acao.prazo
                      ? new Date(`${acao.prazo}T00:00:00`).toLocaleDateString(
                          "pt-BR"
                        )
                      : "—"}
                  </td>
                  <td className={TD}>{acao.reset_count}</td>
                </tr>
              ))}
              {vencidas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-sm text-neutral-500">
                    Nenhuma acao vencida.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">
            Acoes com reincidencia ({recorrentes.length})
          </h2>
          <table className={TABELA}>
            <thead>
              <tr>
                <th className={TH}>Codigo</th>
                <th className={TH}>Setor</th>
                <th className={TH}>Status</th>
                <th className={TH}>Resets</th>
              </tr>
            </thead>
            <tbody>
              {recorrentes.map((acao) => (
                <tr key={acao.id}>
                  <td className={`${TD} font-mono text-neutral-500`}>
                    {acao.codigo}
                  </td>
                  <td className={TD}>{nomeSetor.get(acao.setor_id)}</td>
                  <td className={TD}>{acao.status}</td>
                  <td className={TD}>{acao.reset_count}</td>
                </tr>
              ))}
              {recorrentes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-sm text-neutral-500">
                    Nenhuma acao resetada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">
            Tempo medio de resolucao por setor
          </h2>
          <table className={TABELA}>
            <thead>
              <tr>
                <th className={TH}>Setor</th>
                <th className={TH}>Concluidas</th>
                <th className={TH}>Media (dias)</th>
              </tr>
            </thead>
            <tbody>
              {tempoMedio.map(({ setor, total, media }) => (
                <tr key={setor.id}>
                  <td className={TD}>{nomeSetor.get(setor.id)}</td>
                  <td className={TD}>{total}</td>
                  <td className={TD}>
                    {media === null ? "—" : media.toFixed(1)}
                  </td>
                </tr>
              ))}
              {tempoMedio.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-sm text-neutral-500">
                    Sem dados.
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
