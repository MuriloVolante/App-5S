import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HOME_POR_PAPEL, type AppUser, type Papel } from "@/types";

export async function getUsuarioAtual(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("id, codigo, nome, email, papel, setor_id, created_at")
    .eq("id", user.id)
    .single();

  return (data as AppUser) ?? null;
}

export async function requirePapel(papeis: Papel[]): Promise<AppUser> {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");
  if (!papeis.includes(usuario.papel)) redirect(HOME_POR_PAPEL[usuario.papel]);
  return usuario;
}
