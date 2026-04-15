import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService implements OnModuleInit {
  private encryptionKey: Buffer;
  private readonly ALGORITHM = 'aes-256-gcm';

  onModuleInit() {
    this.loadKeyFromImage();
  }

  private loadKeyFromImage() {
    try {
      // Ścieżka do ukrytego pliku (dawne kuka.png)
      // Zakładając, że process.cwd() to root backendu
      const imagePath = path.join(process.cwd(), 'assets', 'config', 'service_map.dat');
      
      if (!fs.existsSync(imagePath)) {
        console.warn('CRITICAL: Security image missing at ' + imagePath);
        // Fallback or throw error - w trybie bezpiecznym powinniśmy rzucić błąd
        throw new Error('Security asset missing');
      }

      const imageBuffer = fs.readFileSync(imagePath);
      
      // "Przeliczanie pikseli" -> Hashowanie całej zawartości binarium
      this.encryptionKey = crypto.createHash('sha256').update(imageBuffer).digest();
      console.log('Security subsystem initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize security subsystem:', error);
      throw error;
    }
  }

  encrypt(text: any): string {
    if (!text) return text;
    const jsonString = JSON.stringify(text);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.ALGORITHM, this.encryptionKey, iv);
    
    let encrypted = cipher.update(jsonString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // Format: IV:AuthTag:EncryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): any {
    if (!encryptedText || !encryptedText.includes(':')) return encryptedText;

    try {
      const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');
      
      if (!ivHex || !authTagHex || !encryptedHex) return encryptedText;

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.ALGORITHM, this.encryptionKey, iv);
      
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error.message);
      // W przypadku błędu deszyfracji (np. atak) zwracamy null lub rzucamy wyjątek
      throw new Error('Invalid signature or corrupted data');
    }
  }
}
