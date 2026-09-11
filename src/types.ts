export type Papel = "lider" | "coordenador" | "admin";

export type AppUser = {
  id: string;
  codigo: string;
  nome: string;
  email: string;
  papel: Papel | null;
  setor_id: string | null;
  criado_em: string;
};

export type Setor = {
  id: string;
  codigo: string;
  nome: string;
  criado_em: string;
};

export type ChecklistTemplate = {
  id: string;
  codigo: string;
  setor_id: string;
  nome: string;
  criado_em: string;
};

export type ChecklistItem = {
  id: string;
  codigo: string;
  template_id: string;
  descricao: string;
  ordem: number;
  criado_em: string;
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
  conforme: number;
  observacao: string | null;
  foto_url: string | null;
  criado_em: string;
};

export type StatusAcao = "aberta" | "com_prazo" | "vencida" | "concluida";

export type Acao = {
  id: string;
  codigo: string;
  resposta_id: string;
  setor_id: string;
  descricao_problema: string;
  foto_url: string;
  aberto_por: string;
  aberto_em: string;
  prazo: string | null;
  status: StatusAcao;
  reset_count: number;
  concluido_em: string | null;
  concluido_por: string | null;
};

export const HOME_POR_PAPEL: Record<Papel, string> = {
  admin: "/admin/setores",
  coordenador: "/coordenador",
  lider: "/lider",
};

export const ROTULO_PAPEL: Record<Papel, string> = {
  admin: "Admin",
  coordenador: "Coordenador",
  lider: "Líder",
};

export const ROTULO_STATUS_CHECKLIST: Record<StatusChecklist, string> = {
  aberto: "Aberto",
  finalizado: "Finalizado",
};

export const ROTULO_STATUS_ACAO: Record<StatusAcao, string> = {
  aberta: "Aberta",
  com_prazo: "Com prazo",
  vencida: "Vencida",
  concluida: "Concluída",
};
