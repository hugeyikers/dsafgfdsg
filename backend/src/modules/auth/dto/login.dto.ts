// backend/src/modules/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Email nie może być pusty' })
  @IsEmail({}, { message: 'Podano nieprawidłowy format email' })
  email: string;

  @IsNotEmpty({ message: 'Hasło nie może być puste' })
  @IsString()
  @MinLength(6, { message: 'Hasło musi mieć minimum 6 znaków' })
  password: string;
}