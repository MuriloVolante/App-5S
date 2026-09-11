import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";
import { listarAcoesVencidas } from "@/lib/repo";
import AcaoVencida from "./acao-vencida";

const LINKS = [
  { href: "/lider", rotulo: "Checklists" },
  { href: "/lider/avaliacao", rotulo: "Ações vencidas" },
];

export default async function AvaliacaoPage() {
  const usuario = await requirePapel(["lider"]);
  const acoes = listarAcoesVencidas(usuario.setor_id!);

  return (
    <>
      <Header usuario={usuario} links={LINKS} ativo="/lider/avaliacao" />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-5 sm:py-8">
        <div>
          <h1 className="titulo">Avaliação de ações vencidas</h1>
          <p className="subtitulo mt-1">
            Concluir encerra a ação · Resetar devolve para o coordenador definir
            novo prazo
          </p>
        </div>

        {acoes.length === 0 ? (
          <p className="cartao-plano vazio">Nenhuma ação vencida</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {acoes.map((acao) => (
              <AcaoVencida key={acao.id} acao={acao} />
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
