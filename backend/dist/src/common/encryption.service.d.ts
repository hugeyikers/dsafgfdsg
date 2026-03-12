import { OnModuleInit } from '@nestjs/common';
export declare class EncryptionService implements OnModuleInit {
    private encryptionKey;
    private readonly ALGORITHM;
    onModuleInit(): void;
    private loadKeyFromImage;
    encrypt(text: any): string;
    decrypt(encryptedText: string): any;
}
