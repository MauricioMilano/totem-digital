import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Rotas públicas do totem
  if (pathname.startsWith("/totem") || pathname === "/") {
    return NextResponse.next();
  }

  // Rotas de login
  if (pathname.startsWith("/admin/login")) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Rotas protegidas do admin
  if (pathname.startsWith("/admin") || pathname.startsWith("/cardapio") ||
      pathname.startsWith("/servicos") || pathname.startsWith("/clientes") ||
      pathname.startsWith("/comandas")) {
    if (!isLoggedIn && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
