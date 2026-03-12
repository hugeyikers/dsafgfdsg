import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class KanbanService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Check if columns exist, if not create default 3
    const count = await this.prisma.kanbanColumn.count();
    if (count === 0) {
      await this.prisma.kanbanColumn.createMany({
        data: [
          { title: 'Do zrobienia', order: 0, limit: 10 },
          { title: 'W toku', order: 1, limit: 5 },
          { title: 'Zrobione', order: 2, limit: 0 },
        ],
      });
    }
  }

  async findAll() {
    return this.prisma.kanbanColumn.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async createColumn(dto: CreateColumnDto) {
    const maxOrder = await this.prisma.kanbanColumn.findFirst({ orderBy: { order: 'desc' } });
    const order = maxOrder ? maxOrder.order + 1 : 0;
    return this.prisma.kanbanColumn.create({
      data: { ...dto, order },
      include: { items: true },
    });
  }

  async updateColumn(id: number, dto: UpdateColumnDto) {
    return this.prisma.kanbanColumn.update({
      where: { id },
      data: dto,
      include: { items: true },
    });
  }

  async removeColumn(id: number) {
    return this.prisma.kanbanColumn.delete({ where: { id } });
  }

  async createItem(dto: CreateItemDto) {
    const maxOrder = await this.prisma.kanbanItem.findFirst({
        where: { columnId: dto.columnId },
        orderBy: { order: 'desc' } 
    });
    const order = maxOrder ? maxOrder.order + 1 : 0;

    return this.prisma.kanbanItem.create({
      data: { ...dto, order },
    });
  }

  async updateItem(id: number, dto: UpdateItemDto) {
      // Obsługa przeciągania (zmiana columnId i order) wymagałaby bardziej skomplikowanej logiki
      // sortowania wszystkich elementów, tutaj uproszczona aktualizacja
      return this.prisma.kanbanItem.update({
          where: { id },
          data: dto
      });
  }

  async moveBatch(itemIds: number[], targetColumnId: number) {
      // Get max order in target
      const maxOrder = await this.prisma.kanbanItem.findFirst({
          where: { columnId: targetColumnId },
          orderBy: { order: 'desc' }
      });
      let nextOrder = maxOrder ? maxOrder.order + 1 : 0;

      // Update calls
      const updates = itemIds.map(id => {
          const update = this.prisma.kanbanItem.update({
              where: { id },
              data: { columnId: targetColumnId, order: nextOrder }
          });
          nextOrder++;
          return update;
      });

      return await this.prisma.$transaction(updates);
  }

  async removeItem(id: number) {
    return this.prisma.kanbanItem.delete({ where: { id } });
  }

  async reorderColumns(columnIds: number[]) {
    const updates = columnIds.map((id, index) => 
      this.prisma.kanbanColumn.update({
        where: { id },
        data: { order: index },
      })
    );
    return await this.prisma.$transaction(updates);
  }
}
