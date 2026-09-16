import { NextResponse } from "next/server";
import { obterFoto } from "@/lib/repo";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id))
    return new NextResponse("Not found", { status: 404 });

  const foto = await obterFoto(id);
  if (!foto) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(foto.conteudo), {
    headers: {
      "Content-Type": foto.tipo,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
