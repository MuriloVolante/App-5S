import Header from "@/components/header";
import { requireUsuario } from "@/lib/auth";
import { HOME_POR_PAPEL } from "@/types";
import { redirect } from "next/navigation";

export default async function PendentePage() {
  const usuario = await requireUsuario();
  if (usuario.papel) redirect(HOME_POR_PAPEL[usuario.papel]);

  return (
    <>
      <Header usuario={usuario} />
      <main className="mx-auto w-full max-w-md px-4 py-10 sm:px-5 sm:py-12">
        <div className="cartao p-6">
          <h1 className="titulo">Acesso pendente</h1>
          <p className="nota mt-3">
            Sua conta <span className="codigo">{usuario.codigo}</span> foi criada,
            mas ainda não tem papel definido. Peça ao administrador para atribuir
            papel e setor em Admin / Usuários.
          </p>
        </div>
      </main>
    </>
  );
}
