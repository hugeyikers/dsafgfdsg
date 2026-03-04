import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EncryptionService } from '../encryption.service';

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  constructor(private readonly encryptionService: EncryptionService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // 1. Deszyfrowanie przychodzącego body (jeśli istnieje i jest stringiem)
    if (request.body && request.body.data) {
        // Zakładamy, że frontend wysyła { data: "szyfrowany_ciąg" }
      try {
        const decrypted = this.encryptionService.decrypt(request.body.data);
        request.body = decrypted;
      } catch (e) {
        throw new BadRequestException('Security check failed');
      }
    }

    return next.handle().pipe(
      map((data) => {
        // 2. Szyfrowanie wychodzącej odpowiedzi
        // Pomijamy null/undefined
        if (!data) return data;
        
        // Szyfrujemy cały obiekt odpowiedzi
        const encrypted = this.encryptionService.encrypt(data);
        // Zwracamy w formacie { data: "..." }
        return { data: encrypted };
      }),
    );
  }
}
