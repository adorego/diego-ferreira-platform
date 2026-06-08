import { jwtVerify } from 'jose';
import { cookies }    from 'next/headers';

export interface JwtPayload {
  sub:   string;
  email: string;
  role:  'PATIENT' | 'ADMIN';
}

export async function getCurrentUser(): Promise<JwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET!,
    );
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}