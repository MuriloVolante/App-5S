import Link from "next/link";
import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { aplicarVencimentos } from "@/lib/vencimentos";
import { TABELA, TH } from "@/components/ui";
import type { Acao } from "@/types";
import AcaoVencida from "./acao-vencida";

export default async function AvaliacaoPage() {
  const usuario = await requirePapel(["lider"]);
  await aplicarVencimentos();

  const supabase = await createClient();
  const { data } = await supabase
    .from("acoes")
    .select(
      "id, codigo, resposta_id, setor_id, descricao_problema, foto_url, aberto_por, aberto_em, prazo, status, reset_count, concluido_em, concluido_por"
    )
    .eq("setor_id", usuario.setor_id!)
    .eq("status", "vencida")
    .order("prazo");

  const acoes = (data ?? []) as Acao[];

  return (
    <>
      <Header usuario={usuario} />
      <main className="flex flex-col gap-6 p-6">
        <div>
          <Link href="/lider" className="text-sm text-neutral-500">
            &larr; Home
          </Link>
          <h1 className="mt-1 text-lg font-semibold">Acoes vencidas</h1>
        </div>
        <table className={TABELA}>
          <thead>
            <tr>
              <th className={TH}>Codigo</th>
              <th className={TH}>Problema</th>
              <th className={TH}>Prazo original</th>
              <th className={TH}>Resets</th>
              <th className={TH} />
            </tr>
          </thead>
          <tbody>
            {acoes.map((acao) => (
              <AcaoVencida key={acao.id} acao={acao} />
            ))}
            {acoes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-sm text-neutral-500">
                  Nenhuma acao vencida.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </>
  );
}
