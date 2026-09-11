import Marca from "@/components/marca";
import NavLinks, { type LinkNav } from "@/components/nav-links";
import { ROTULO_PAPEL, type AppUser } from "@/types";

export type { LinkNav };

export default function Header({
  usuario,
  links = [],
}: {
  usuario: AppUser;
  links?: LinkNav[];
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

      {links.length > 0 && <NavLinks links={links} />}

      <div className="faixa-laranja" />
    </header>
  );
}
