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

export type StatusChecklist = "aberto" | "finalizado";

export type Checklist = {
  id: string;
  codigo: string;
  setor_id: string;
  lider_id: string;
  template_id: string;
  data_criacao: string;
  status: StatusChecklist;
  finalizado_em: string | null;
};

export type ChecklistResposta = {
  id: string;
  checklist_id: string;
  item_id: string;
  conforme: boolean;
  observacao: string | null;
  foto_url: string | null;
  created_at: string;
};
