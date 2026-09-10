import { createClient } from "@/lib/supabase/server";
import { TABELA, TH } from "@/components/ui";
import type { AppUser, Setor } from "@/types";
import UsuarioForm from "./usuario-form";
import UsuarioLinha from "./usuario-linha";

export default async function UsuariosPage() {
  const supabase = await createClient();

  const [{ data: usuariosData, error }, { data: setoresData }] =
    await Promise.all([
      supabase
        .from("users")
        .select("id, codigo, nome, email, papel, setor_id, created_at")
        .order("codigo"),
      supabase.from("setores").select("id, codigo, nome, created_at").order("codigo"),
    ]);

  const usuarios = (usuariosData ?? []) as AppUser[];
  const setores = (setoresData ?? []) as Setor[];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold">Usuarios</h1>
      <UsuarioForm setores={setores} />
      {error && <p className="text-sm text-red-600">{error.message}</p>}
      <table className={TABELA}>
        <thead>
          <tr>
            <th className={TH}>Codigo</th>
            <th className={TH}>Nome / papel / setor</th>
            <th className={TH}>Email</th>
            <th className={TH} />
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <UsuarioLinha key={usuario.id} usuario={usuario} setores={setores} />
          ))}
          {usuarios.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-4 text-sm text-neutral-500">
                Nenhum usuario cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
