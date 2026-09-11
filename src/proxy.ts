import { NextResponse, type NextRequest } from "next/server";

const PUBLICAS = ["/login", "/logout"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLICAS.some((rota) => pathname.startsWith(rota)))
    return NextResponse.next();

  if (!request.cookies.get("vigia_sessao")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/fotos|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
