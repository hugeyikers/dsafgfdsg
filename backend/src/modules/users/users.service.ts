import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Pobranie wszystkich użytkowników
  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { id: 'asc' }
    });
  }

  // Tworzenie użytkownika (Secure Create)
  async create(data: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email jest już zajęty.');

    // HASHOWANIE HASŁA (Best Practice)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }

  // Edycja użytkownika
  async update(id: number, data: any) {
    // Jeśli zmieniamy hasło, trzeba je zahashować
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Nie znaleziono użytkownika o ID ${id}`);
    }
  }

  // Usuwanie
  async remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}