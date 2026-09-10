export type Papel = "lider" | "coordenador" | "admin";

export type Setor = {
  id: string;
  codigo: string;
  nome: string;
  created_at: string;
};

export type AppUser = {
  id: string;
  codigo: string;
  nome: string;
  email: string;
  papel: Papel;
  setor_id: string | null;
  created_at: string;
};

export const HOME_POR_PAPEL: Record<Papel, string> = {
  admin: "/admin",
  coordenador: "/coordenador",
  lider: "/lider",
};

export type ChecklistTemplate = {
  id: string;
  codigo: string;
  setor_id: string;
  nome: string;
  created_at: string;
};

export type ChecklistItem = {
  id: string;
  codigo: string;
  template_id: string;
  descricao: string;
  ordem: number;
  created_at: string;
};
