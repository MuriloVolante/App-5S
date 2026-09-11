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

  const vazio = contarUsuarios() === 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-5 py-10">
      <Marca />
      <LoginForm />
      <p className="nota">
        {vazio
          ? "A primeira conta criada vira administradora. As demais comecam sem papel e precisam de liberacao do administrador."
          : "Contas novas comecam sem papel e precisam de liberacao do administrador."}
      </p>
    </main>
  );
}
