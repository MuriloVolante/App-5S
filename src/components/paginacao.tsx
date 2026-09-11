import Link from "next/link";

export default function Paginacao({
  base,
  pagina,
  paginas,
  total,
  rotulo,
  parametro = "pagina",
}: {
  base: string;
  pagina: number;
  paginas: number;
  total: number;
  rotulo: string;
  parametro?: string;
}) {
  if (total === 0) return null;

  const separador = base.includes("?") ? "&" : "?";
  const endereco = (destino: number) =>
    `${base}${separador}${parametro}=${destino}`;

  return (
    <div className="paginacao">
      <span className="subtitulo">
        {total} {rotulo} · página {pagina} de {paginas}
      </span>

      {paginas > 1 && (
        <span className="paginacao-botoes">
          {pagina > 1 ? (
            <Link
              href={endereco(pagina - 1)}
              className="botao botao-secundario botao-mini"
            >
              Anterior
            </Link>
          ) : (
            <span className="botao botao-secundario botao-mini opacity-40">
              Anterior
            </span>
          )}
          {pagina < paginas ? (
            <Link
              href={endereco(pagina + 1)}
              className="botao botao-secundario botao-mini"
            >
              Próxima
            </Link>
          ) : (
            <span className="botao botao-secundario botao-mini opacity-40">
              Próxima
            </span>
          )}
        </span>
      )}
    </div>
  );
}

export function lerPagina(valor: string | string[] | undefined) {
  const numero = Number(Array.isArray(valor) ? valor[0] : valor);
  return Number.isFinite(numero) && numero > 0 ? Math.trunc(numero) : 1;
}
