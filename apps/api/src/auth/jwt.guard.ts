import {
  Injectable, CanActivate,
  ExecutionContext, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private cfg: ConfigService,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();

    // Acepta cookie o header Authorization: Bearer <token>
    const token =
      req.cookies?.access_token ??
      req.headers?.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException();

    try {
      req.user = this.jwt.verify(token, {
        secret: this.cfg.get('JWT_SECRET'),
      });
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}