import Link from "next/link";
import Marca from "@/components/marca";
import { ROTULO_PAPEL, type AppUser } from "@/types";

export type LinkNav = { href: string; rotulo: string };

export default function Header({
  usuario,
  links = [],
  ativo,
}: {
  usuario: AppUser;
  links?: LinkNav[];
  ativo?: string;
}) {
  return (
    <header className="border-b-2 border-[var(--tinta)] bg-[var(--papel-claro)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Marca compacta />

        <nav className="flex flex-wrap items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`link-nav ${ativo === link.href ? "link-nav-ativo" : ""}`}
            >
              {link.rotulo}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-right">
            <span className="block text-[12px] font-bold">{usuario.nome}</span>
            <span className="marca-sub">
              {usuario.codigo} ·{" "}
              {usuario.papel ? ROTULO_PAPEL[usuario.papel] : "Sem papel"}
            </span>
          </span>
          <form action="/logout" method="post">
            <button type="submit" className="botao botao-secundario botao-mini">
              Sair
            </button>
          </form>
        </div>
      </div>
      <div className="faixa-laranja" />
    </header>
  );
}
