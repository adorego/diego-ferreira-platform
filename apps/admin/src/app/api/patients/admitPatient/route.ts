import { NextRequest, NextResponse } from 'next/server';

// Ver /api/patients/sessions/route.ts — mismo motivo para reenviar la cookie
// server-side en vez de depender de un fetch directo del browser a la API.
export async function POST(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  const body = await req.json();

  const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients/admitPatient`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Cookie: `access_token=${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await apiRes.json();
  return NextResponse.json(data, { status: apiRes.status });
}
