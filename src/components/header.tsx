import type { AppUser } from "@/types";

const ROTULO_PAPEL = {
  admin: "Admin",
  coordenador: "Coordenador",
  lider: "Lider",
} as const;

export default function Header({ usuario }: { usuario: AppUser }) {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
      <div className="text-sm">
        <span className="font-medium">{usuario.nome}</span>{" "}
        <span className="text-neutral-500">
          ({usuario.codigo} &middot; {ROTULO_PAPEL[usuario.papel]})
        </span>
      </div>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm"
        >
          Sair
        </button>
      </form>
    </header>
  );
}
