"use client";

import { useEffect, useState } from "react";

export default function Foto({
  url,
  legenda,
}: {
  url: string;
  legenda: string;
}) {
  const [aberta, setAberta] = useState(false);

  useEffect(() => {
    if (!aberta) return;

    const fechar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAberta(false);
    };

    window.addEventListener("keydown", fechar);
    return () => window.removeEventListener("keydown", fechar);
  }, [aberta]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberta(true)}
        className="miniatura"
        title="Ampliar foto"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={legenda} />
      </button>

      {aberta && (
        <div
          className="modal-fundo"
          role="dialog"
          aria-modal="true"
          onClick={() => setAberta(false)}
        >
          <div
            className="cartao foto-ampliada"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="foto-ampliada-topo">
              <span className="subtitulo">{legenda}</span>
              <button
                type="button"
                onClick={() => setAberta(false)}
                className="botao botao-secundario botao-mini"
              >
                Fechar
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={legenda} />
          </div>
        </div>
      )}
    </>
  );
}
