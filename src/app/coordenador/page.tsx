import Header from "@/components/header";
import { requirePapel } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TABELA, TH } from "@/components/ui";
import type { Acao } from "@/types";
import AcaoLinha from "./acao-linha";

export default async function CoordenadorPage() {
  const usuario = await requirePapel(["coordenador"]);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("acoes")
    .select(
      "id, codigo, resposta_id, setor_id, descricao_problema, foto_url, aberto_por, aberto_em, prazo, status, reset_count, concluido_em, concluido_por"
    )
    .eq("setor_id", usuario.setor_id!)
    .order("aberto_em", { ascending: false });

  const acoes = (data ?? []) as Acao[];

  return (
    <>
      <Header usuario={usuario} />
      <main className="flex flex-col gap-6 p-6">
        <h1 className="text-lg font-semibold">Acoes do setor</h1>
        {error && <p className="text-sm text-red-600">{error.message}</p>}
        <table className={TABELA}>
          <thead>
            <tr>
              <th className={TH}>Codigo</th>
              <th className={TH}>Problema</th>
              <th className={TH}>Status</th>
              <th className={TH}>Prazo</th>
              <th className={TH}>Resets</th>
            </tr>
          </thead>
          <tbody>
            {acoes.map((acao) => (
              <AcaoLinha key={acao.id} acao={acao} />
            ))}
            {acoes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-sm text-neutral-500">
                  Nenhuma acao no setor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </>
  );
}
