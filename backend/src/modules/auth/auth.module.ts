import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
// 1. Importujemy PassportModule
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy'; // Będziemy tego potrzebować (patrz krok 3)
import { jwtConstants } from './constants';

@Module({
  imports: [
    // 2. Rejestrujemy PassportModule
    PassportModule, 
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  // 3. Dodajemy JwtStrategy do providers
  providers: [AuthService, PrismaService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, PassportModule, JwtModule, JwtStrategy],
})
export class AuthModule {}