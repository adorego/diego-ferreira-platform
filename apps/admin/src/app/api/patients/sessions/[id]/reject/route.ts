import { NextRequest, NextResponse } from 'next/server';

// Ver /api/patients/sessions/route.ts — mismo motivo para reenviar la cookie
// server-side en vez de depender de un fetch directo del browser a la API.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = req.cookies.get('access_token')?.value;

  const apiRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/patients/sessions/${id}/reject`,
    {
      method:  'POST',
      headers: token ? { Cookie: `access_token=${token}` } : {},
    },
  );

  const data = await apiRes.json();
  return NextResponse.json(data, { status: apiRes.status });
}
