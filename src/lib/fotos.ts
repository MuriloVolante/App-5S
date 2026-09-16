import { guardarFoto } from "@/lib/repo";

const TIPOS = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
]);

const TAMANHO_MAXIMO = 8 * 1024 * 1024;

export async function salvarFoto(arquivo: File) {
  if (!TIPOS.has(arquivo.type)) return null;
  if (arquivo.size > TAMANHO_MAXIMO) return null;

  const id = await guardarFoto(
    arquivo.type,
    Buffer.from(await arquivo.arrayBuffer())
  );

  return `/api/fotos/${id}`;
}
