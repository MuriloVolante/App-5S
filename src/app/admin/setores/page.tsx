import { createClient } from "@/lib/supabase/server";
import { TABELA, TH } from "@/components/ui";
import type { Setor } from "@/types";
import SetorForm from "./setor-form";
import SetorLinha from "./setor-linha";

export default async function SetoresPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("setores")
    .select("id, codigo, nome, created_at")
    .order("codigo");

  const setores = (data ?? []) as Setor[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Setores</h1>
      <SetorForm />
      {error && <p className="text-sm text-red-600">{error.message}</p>}
      <table className={TABELA}>
        <thead>
          <tr>
            <th className={TH}>Codigo</th>
            <th className={TH}>Nome</th>
            <th className={TH} />
          </tr>
        </thead>
        <tbody>
          {setores.map((setor) => (
            <SetorLinha key={setor.id} setor={setor} />
          ))}
          {setores.length === 0 && (
            <tr>
              <td colSpan={3} className="px-3 py-4 text-sm text-neutral-500">
                Nenhum setor cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
