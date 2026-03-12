// backend/src/modules/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtConstants } from './constants';

// Interfejs payloadu z tokena
interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Tokeny wygasłe będą odrzucane automatycznie
      secretOrKey: jwtConstants.secret,
    });
  }

  // Metoda validate jest wywoływana po weryfikacji podpisu tokena
  async validate(payload: JwtPayload) {
    if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
    }
    // Zwracamy obiekt, który NestJS wstrzyknie do Request object jako req.user
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}