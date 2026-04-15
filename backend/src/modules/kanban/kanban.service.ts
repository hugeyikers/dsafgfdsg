import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateRowDto } from './dto/create-row.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { UpdateRowDto } from './dto/update-row.dto';

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
    const columns = await this.prisma.kanbanColumn.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: { assignedUsers: true },
        },
      },
      orderBy: { order: 'asc' },
    });
    const rows = await this.prisma.kanbanRow.findMany({
      orderBy: { order: 'asc' },
    });

    return { columns, rows };
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

 async createRow(dto: CreateRowDto) {
    const maxOrder = await this.prisma.kanbanRow.findFirst({ orderBy: { order: 'desc' } });
    const order = maxOrder ? maxOrder.order + 1 : 0;
    return this.prisma.kanbanRow.create({
      data: { ...dto, order },
      include: { items: true },
    });
  }

  async updateRow(id: number, dto: UpdateRowDto) {
    return this.prisma.kanbanRow.update({
      where: { id },
      data: dto,
      include: { items: true },
    });
  }

  async removeRow(id: number) {
    return this.prisma.kanbanRow.delete({ where: { id } });
  }

  async createItem(dto: CreateItemDto) {
    const maxOrder = await this.prisma.kanbanItem.findFirst({
        where: { columnId: dto.columnId },
        orderBy: { order: 'desc' } 
    });
    const order = maxOrder ? maxOrder.order + 1 : 0;

    return this.prisma.kanbanItem.create({
      data: { 
        title: dto.title,
        content: dto.content,
        columnId: dto.columnId,
        rowId: dto.rowId || null,
        order,
        color: dto.color || null,
        // Użyj 'connect' aby powiązać tablicę ID z użytkownikami
        assignedUsers: {
            connect: dto.assignedUsersIds?.map(id => ({ id })) || []
        }
      },
      include: { assignedUsers: true },
    });
  }

  async createSubtask(dto: CreateSubtaskDto) {
    return this.prisma.kanbanSubtask.create({
      data: {
        title: dto.title,
        content: dto.content,
        itemId: dto.itemId,
        isDone: dto.isDone,
      },
    });
  }

  async updateSubtask(id: number, dto: UpdateSubtaskDto) {
    return this.prisma.kanbanSubtask.update({
      where: { id },
      data: dto,
    });
  }

  async removeSubtask(id: number) {
    return this.prisma.kanbanSubtask.delete({ where: { id } });
  }

  async updateItem(id: number, dto: UpdateItemDto) {
      const { assignedUsersIds, ...restDto } = dto;
      
      const updateData: any = { ...restDto };
      
      if (assignedUsersIds !== undefined) {
          updateData.assignedUsers = {
              set: assignedUsersIds.map(userId => ({ id: userId }))
          };
      }

      return this.prisma.kanbanItem.update({
          where: { id },
          data: updateData,
          include: { assignedUsers: true }
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

  async reorderRows(rowIds: number[]) {
    const updates = rowIds.map((id, index) => 
      this.prisma.kanbanRow.update({
        where: { id },
        data: { order: index },
      })
    );
    return await this.prisma.$transaction(updates);
  }
}
