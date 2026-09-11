import Header from "@/components/header";
import { LINKS_AUDITOR } from "../links";
import { requirePapel } from "@/lib/auth";
import { listarAcoesVencidas } from "@/lib/repo";
import AcaoVencida from "./acao-vencida";



export default async function AvaliacaoPage() {
  const usuario = await requirePapel(["auditor"]);
  const acoes = listarAcoesVencidas(usuario.setor_id!);

  return (
    <>
      <Header usuario={usuario} links={LINKS_AUDITOR} ativo="/auditor/avaliacao" />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-5 sm:py-8">
        <div>
          <h1 className="titulo">Avaliação de ações vencidas</h1>
          <p className="subtitulo mt-1">
            Concluir encerra a ação · Resetar devolve para o embaixador definir novo
            prazo
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
