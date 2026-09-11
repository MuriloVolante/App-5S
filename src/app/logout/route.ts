import { NextResponse, type NextRequest } from "next/server";
import { encerrarSessao } from "@/lib/sessao";

export async function POST(request: NextRequest) {
  await encerrarSessao();
  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
