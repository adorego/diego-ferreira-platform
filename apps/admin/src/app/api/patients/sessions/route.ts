import { NextRequest, NextResponse } from 'next/server';

// Mismo motivo que /api/auth/login: la cookie access_token queda scopeada al
// dominio del admin (donde el navegador la guardó), así que un fetch directo del
// browser a la API (otro dominio) nunca la incluiría. Este proxy corre server-side
// y la reenvía explícitamente como Cookie hacia la API.
export async function GET(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;

  const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients/sessions`, {
    headers: token ? { Cookie: `access_token=${token}` } : {},
  });

  const data = await apiRes.json();
  return NextResponse.json(data, { status: apiRes.status });
}
