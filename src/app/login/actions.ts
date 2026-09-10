"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HOME_POR_PAPEL, type Papel } from "@/types";

export type LoginState = { erro: string | null };

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) return { erro: "Informe email e senha." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error || !data.user) return { erro: "Email ou senha invalidos." };

  const { data: perfil } = await supabase
    .from("users")
    .select("papel")
    .eq("id", data.user.id)
    .single();

  if (!perfil) {
    await supabase.auth.signOut();
    return { erro: "Usuario sem perfil cadastrado. Contate o admin." };
  }

  redirect(HOME_POR_PAPEL[perfil.papel as Papel]);
}
