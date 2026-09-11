import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";
import { listarAcoesVencidas } from "@/lib/repo";
import AcaoVencida from "./acao-vencida";

const LINKS = [
  { href: "/lider", rotulo: "Checklists" },
  { href: "/lider/avaliacao", rotulo: "Acoes vencidas" },
];

export default async function AvaliacaoPage() {
  const usuario = await requirePapel(["lider"]);
  const acoes = listarAcoesVencidas(usuario.setor_id!);

  return (
    <>
      <Header usuario={usuario} links={LINKS} ativo="/lider/avaliacao" />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-8">
        <div>
          <h1 className="titulo">Avaliacao de acoes vencidas</h1>
          <p className="subtitulo mt-1">
            Concluir encerra a acao · Resetar devolve para o coordenador definir
            novo prazo
          </p>
        </div>

        <table className="tabela">
          <thead>
            <tr>
              <th className="w-32">Codigo</th>
              <th>Problema</th>
              <th className="w-40">Prazo original</th>
              <th className="w-24">Resets</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {acoes.map((acao) => (
              <AcaoVencida key={acao.id} acao={acao} />
            ))}
            {acoes.length === 0 && (
              <tr>
                <td colSpan={5} className="vazio">
                  Nenhuma acao vencida
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </>
  );
}
