import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";
import { listarAcoesDoSetor } from "@/lib/repo";
import { ROTULO_STATUS_ACAO, type StatusAcao } from "@/types";
import AcaoLinha from "./acao-linha";

const LINKS = [
  { href: "/coordenador", rotulo: "Acoes do setor" },
  { href: "/dashboard", rotulo: "Dashboard" },
];

const STATUS: StatusAcao[] = ["aberta", "com_prazo", "vencida", "concluida"];

export default async function CoordenadorPage() {
  const usuario = await requirePapel(["coordenador"]);
  const acoes = listarAcoesDoSetor(usuario.setor_id!);

  return (
    <>
      <Header usuario={usuario} links={LINKS} ativo="/coordenador" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8">
        <div>
          <h1 className="titulo">Acoes do setor</h1>
          <p className="subtitulo mt-1">
            Acao aberta precisa de prazo para entrar em acompanhamento
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {STATUS.map((status) => (
            <div key={status} className="indicador">
              <p className="indicador-valor">
                {acoes.filter((acao) => acao.status === status).length}
              </p>
              <p className="indicador-rotulo">{ROTULO_STATUS_ACAO[status]}</p>
            </div>
          ))}
        </div>

        <table className="tabela">
          <thead>
            <tr>
              <th className="w-32">Codigo</th>
              <th>Problema</th>
              <th className="w-36">Status</th>
              <th className="w-64">Prazo</th>
              <th className="w-24">Resets</th>
            </tr>
          </thead>
          <tbody>
            {acoes.map((acao) => (
              <AcaoLinha key={acao.id} acao={acao} />
            ))}
            {acoes.length === 0 && (
              <tr>
                <td colSpan={5} className="vazio">
                  Nenhuma acao no setor
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </>
  );
}
