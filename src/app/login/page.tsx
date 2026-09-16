import { redirect } from "next/navigation";
import Marca from "@/components/marca";
import { getUsuarioAtual } from "@/lib/auth";
import { contarUsuarios } from "@/lib/repo";
import { HOME_POR_PAPEL } from "@/types";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const usuario = await getUsuarioAtual();
  if (usuario)
    redirect(usuario.papel ? HOME_POR_PAPEL[usuario.papel] : "/pendente");

  const vazio = await contarUsuarios() === 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-4 py-10 sm:px-5">
      <Marca />
      <LoginForm />
      <p className="nota">
        {vazio
          ? "A primeira conta criada vira administradora. As demais começam sem papel e precisam de liberação do administrador."
          : "Contas novas começam sem papel e precisam de liberação do administrador."}
      </p>
    </main>
  );
}
