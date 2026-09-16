"use client";

const LADO_MAXIMO = 1600;
const QUALIDADE = 0.72;

// Foto de celular chega com varios MB e estoura o limite de corpo da Server
// Action. Reduz e recodifica em JPEG antes de enviar.
export async function comprimirImagem(arquivo: File): Promise<File> {
  if (!arquivo.type.startsWith("image/")) return arquivo;

  try {
    const bitmap = await createImageBitmap(arquivo);
    const escala = Math.min(
      1,
      LADO_MAXIMO / Math.max(bitmap.width, bitmap.height)
    );

    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);

    const tela = document.createElement("canvas");
    tela.width = largura;
    tela.height = altura;

    const contexto = tela.getContext("2d");
    if (!contexto) return arquivo;

    contexto.drawImage(bitmap, 0, 0, largura, altura);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolver) =>
      tela.toBlob(resolver, "image/jpeg", QUALIDADE)
    );

    if (!blob || blob.size >= arquivo.size) return arquivo;

    return new File([blob], "foto.jpg", { type: "image/jpeg" });
  } catch {
    return arquivo;
  }
}
