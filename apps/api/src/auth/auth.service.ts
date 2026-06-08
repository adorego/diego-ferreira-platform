import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    const payload = {
      sub:   user.id.toString(),
      email: user.email,
      role:  user.role,
    };
    const access_token = this.jwt.sign(payload);

    return {
      access_token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  async createUser(data: {
    name: string; email: string;
    password: string; role?: string;
  }) {
    const hash = await bcrypt.hash(data.password, 12);
    return this.prisma.user.create({
      data: {
        name: data.name, email: data.email,
        passwordHash: hash,
        role: (data.role as any) ?? 'PATIENT',
      },
    });
  }
}