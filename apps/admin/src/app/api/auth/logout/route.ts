import { NextResponse } from 'next/server';

// Mismo motivo que los otros proxies: la cookie access_token está scopeada al
// dominio del admin, así que hay que borrarla en una respuesta de este mismo
// origen — un fetch directo del browser a la API no la tocaría.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('access_token');
  return res;
}
