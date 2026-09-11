import { NextResponse } from "next/server";
import { lerFoto, tipoPorExtensao } from "@/lib/fotos";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ caminho: string[] }> }
) {
  const { caminho } = await params;
  const conteudo = await lerFoto(caminho);

  if (!conteudo) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(conteudo), {
    headers: {
      "Content-Type": tipoPorExtensao(caminho.at(-1) ?? ""),
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
