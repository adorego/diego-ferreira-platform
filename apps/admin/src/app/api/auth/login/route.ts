import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
      credentials: 'include',
    },
  );

  const data = await apiRes.json();
  if (!apiRes.ok) {
    return NextResponse.json(data, { status: apiRes.status });
  }

  // Propagar la cookie que viene del backend — al pasar por este proxy same-origin,
  // el navegador la guarda bajo el dominio del admin (no el de la API), que es lo
  // que el middleware del admin necesita para poder leerla en requests a /dashboard.
  const res = NextResponse.json(data);
  const setCookie = apiRes.headers.get('set-cookie');
  if (setCookie) res.headers.set('set-cookie', setCookie);

  return res;
}
