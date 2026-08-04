import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  const { pathname } = req.nextUrl;
  const isAuthOnly = pathname === '/login';

  if (isAuthOnly) {
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/dashboard', req.url));
      } catch {
        // Token inválido/expirado — dejar pasar a /login normalmente.
      }
    }
    return NextResponse.next();
  }

  // Cualquier otra ruta (incluida /dashboard) requiere sesión válida.
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    await jwtVerify(token, secret);
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete('access_token');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  // Excluye /api/* además de los estáticos: son route handlers (login, patients/*)
  // que corren su propia lógica de auth server-side vía cookie/header, no páginas —
  // dejarlos pasar por acá los redirige (307 a /login) en vez de devolver JSON,
  // rompiendo tanto el login mismo (sin cookie todavía) como cualquier fetch desde
  // el dashboard si la cookie llega a expirar en el medio.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
