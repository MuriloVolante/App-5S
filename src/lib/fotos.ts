import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const RAIZ =
  process.env.UPLOADS_DIR ?? path.join(process.cwd(), "data", "uploads");

const EXTENSOES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
};

export async function salvarFoto(arquivo: File, pasta: string) {
  const extensao = EXTENSOES[arquivo.type] ?? "bin";
  const nome = `${randomUUID()}.${extensao}`;
  const destino = path.join(RAIZ, pasta);

  await fs.mkdir(destino, { recursive: true });
  await fs.writeFile(
    path.join(destino, nome),
    Buffer.from(await arquivo.arrayBuffer())
  );

  return `/api/fotos/${pasta}/${nome}`;
}

export async function lerFoto(segmentos: string[]) {
  const relativo = path.join(...segmentos);
  const destino = path.resolve(RAIZ, relativo);

  if (!destino.startsWith(path.resolve(RAIZ))) return null;

  try {
    return await fs.readFile(destino);
  } catch {
    return null;
  }
}

export function tipoPorExtensao(nome: string) {
  const extensao = nome.split(".").pop()?.toLowerCase();
  const tipos: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    heic: "image/heic",
  };
  return tipos[extensao ?? ""] ?? "application/octet-stream";
}
