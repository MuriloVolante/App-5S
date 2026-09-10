"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUsuarioAtual } from "@/lib/auth";
import type { EstadoAcao } from "@/lib/actions";
import type { Papel } from "@/types";

const PAPEIS: Papel[] = ["lider", "coordenador", "admin"];

type Campos = {
  nome: string;
  papel: Papel;
  setor_id: string | null;
};

async function exigirAdmin(): Promise<string | null> {
  const atual = await getUsuarioAtual();
  return atual?.papel === "admin" ? null : "Acesso negado.";
}

function lerCampos(formData: FormData): Campos | string {
  const nome = String(formData.get("nome") ?? "").trim();
  const papel = String(formData.get("papel") ?? "") as Papel;
  const setorId = String(formData.get("setor_id") ?? "");

  if (!nome) return "Informe o nome.";
  if (!PAPEIS.includes(papel)) return "Papel invalido.";
  if (papel !== "admin" && !setorId) return "Selecione o setor.";

  return { nome, papel, setor_id: papel === "admin" ? null : setorId };
}

export async function criarUsuario(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const negado = await exigirAdmin();
  if (negado) return { erro: negado };

  const campos = lerCampos(formData);
  if (typeof campos === "string") return { erro: campos };

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  if (!email) return { erro: "Informe o email." };
  if (senha.length < 6) return { erro: "Senha deve ter ao menos 6 caracteres." };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  });
  if (error || !data.user) return { erro: error?.message ?? "Falha no Auth." };

  const { error: erroPerfil } = await admin
    .from("users")
    .insert({ id: data.user.id, email, ...campos });

  if (erroPerfil) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { erro: erroPerfil.message };
  }

  revalidatePath("/admin/usuarios");
  return { erro: null, ok: true };
}

export async function atualizarUsuario(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const negado = await exigirAdmin();
  if (negado) return { erro: negado };

  const id = String(formData.get("id") ?? "");
  if (!id) return { erro: "Usuario invalido." };

  const campos = lerCampos(formData);
  if (typeof campos === "string") return { erro: campos };

  const admin = createAdminClient();
  const { error } = await admin.from("users").update(campos).eq("id", id);
  if (error) return { erro: error.message };

  revalidatePath("/admin/usuarios");
  return { erro: null, ok: true };
}

export async function excluirUsuario(
  _prev: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const negado = await exigirAdmin();
  if (negado) return { erro: negado };

  const id = String(formData.get("id") ?? "");
  if (!id) return { erro: "Usuario invalido." };

  const atual = await getUsuarioAtual();
  if (atual?.id === id) return { erro: "Nao e possivel excluir a si mesmo." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { erro: error.message };

  revalidatePath("/admin/usuarios");
  return { erro: null, ok: true };
}
