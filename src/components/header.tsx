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
    <header className="cabecalho">
      <div className="cabecalho-topo">
        <Marca compacta />

        <div className="cabecalho-usuario">
          <span className="cabecalho-nome">
            <span className="text-[12px] font-bold">{usuario.nome}</span>
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

      {links.length > 0 && (
        <nav className="cabecalho-nav">
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
      )}

      <div className="faixa-laranja" />
    </header>
  );
}
