import { redirect } from "next/navigation";
import { getUsuarioAtual } from "@/lib/auth";
import { HOME_POR_PAPEL } from "@/types";

export default async function Home() {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");
  redirect(usuario.papel ? HOME_POR_PAPEL[usuario.papel] : "/pendente");
}
