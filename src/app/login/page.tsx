import { redirect } from "next/navigation";
import { getUsuarioAtual } from "@/lib/auth";
import { HOME_POR_PAPEL } from "@/types";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const usuario = await getUsuarioAtual();
  if (usuario) redirect(HOME_POR_PAPEL[usuario.papel]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6">
        <h1 className="mb-6 text-lg font-semibold">Checklist de Conformidade</h1>
        <LoginForm />
      </div>
    </main>
  );
}
