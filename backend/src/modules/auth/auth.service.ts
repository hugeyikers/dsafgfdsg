// backend/src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client'; // Import enumów z Prisma

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    // 1. Pobieramy użytkownika
    const user = await this.prisma.user.findUnique({ where: { email } });

    // 2. Zabezpieczenie przed Timing Attack:
    // Nawet jeśli użytkownik nie istnieje, wykonujemy operację porównania hasła na "pustym" hashu,
    // aby czas odpowiedzi był zbliżony w obu przypadkach (user istnieje vs nie istnieje).
    // W przeciwnym razie haker mógłby zgadywać emaile na podstawie czasu odpowiedzi API.
    const dummyHash = '$2b$10$abcdefghijklmnopqrstuv'; // Przykładowy hash
    const isMatch = user 
      ? await bcrypt.compare(pass, user.password)
      : await bcrypt.compare(pass, dummyHash); // Fałszywe porównanie, żeby zmarnować czas procesora

    if (!user || !isMatch) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }

    // 3. Generujemy token JWT
    // Payload powinien być minimalny, ale wystarczający
    const payload = { sub: user.id, email: user.email, role: user.role };
    
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }
}