import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateRowDto } from './dto/create-row.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { UpdateRowDto } from './dto/update-row.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@Injectable()
export class KanbanService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  private toDateOrUndefined(value?: string | null) {
    return value ? new Date(value) : undefined;
  }

  private getItemHistoryInclude(): any {
    return {
      column: {
        select: {
          id: true,
          title: true,
          order: true,
          limit: true,
          color: true,
        },
      },
      row: {
        select: {
          id: true,
          title: true,
          order: true,
          limit: true,
          color: true,
        },
      },
      parent: {
        select: {
          id: true,
          title: true,
        },
      },
      assignedUsers: {
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
        },
      },
      subtasks: {
        orderBy: { id: 'asc' as const },
        select: {
          id: true,
          itemId: true,
          title: true,
          content: true,
          createdAt: true,
          isDone: true,
        },
      },
      childs: {
        orderBy: { id: 'asc' as const },
        select: {
          id: true,
          title: true,
          content: true,
          order: true,
          columnId: true,
          rowId: true,
          parentId: true,
          color: true,
          deadline: true,
          size: true,
          archived: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    };
  }

  private async getItemSnapshot(db: any, id: number) {
    return db.kanbanItem.findUnique({
      where: { id },
      include: this.getItemHistoryInclude(),
    });
  }

  private async pruneItemHistory(db: any) {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

    await db.kanbanItemHistory.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  }

  private async createItemHistory(
    db: any,
    itemId: number,
    action: 'CREATED' | 'UPDATED' | 'DELETED',
    beforeState?: any,
    afterState?: any,
  ) {
    await db.kanbanItemHistory.create({
      data: {
        itemId,
        action,
        beforeState: beforeState ?? undefined,
        afterState: afterState ?? undefined,
      },
    });
  }

  async onModuleInit() {
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
          include: {
            assignedUsers: true,
            subtasks: { orderBy: { id: 'asc' } },
            childs: { orderBy: { id: 'asc' } },
          },
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
      data: {
        title: dto.title,
        limit: dto.limit,
        color: dto.color || null,
        order,
      },
      include: { items: true },
    });
  }

  async updateRow(id: number, dto: UpdateRowDto) {
    return this.prisma.kanbanRow.update({
      where: { id },
      data: {
        title: dto.title,
        limit: dto.limit,
        order: dto.order,
        color: dto.color || null,
      },
      include: { items: true },
    });
  }

  async removeRow(id: number) {
    return this.prisma.kanbanRow.delete({ where: { id } });
  }

  async createItem(dto: CreateItemDto) {
    return this.prisma.$transaction(async (tx) => {
      const maxOrder = await tx.kanbanItem.findFirst({
        where: { columnId: dto.columnId },
        orderBy: { order: 'desc' },
      });
      const order = maxOrder ? maxOrder.order + 1 : 0;

      const item = await tx.kanbanItem.create({
        data: {
          title: dto.title,
          content: dto.content,
          columnId: dto.columnId,
          rowId: dto.rowId ?? null,
          parentId: dto.parentId ?? null,
          order,
          color: dto.color || null,
          deadline: this.toDateOrUndefined(dto.deadline),
          size: dto.size ?? 'M',
          archived: dto.archived ?? false,
          assignedUsers: {
            connect: dto.assignedUsersIds?.map(id => ({ id })) || [],
          },
        },
        include: this.getItemHistoryInclude(),
      });

      await this.createItemHistory(tx, item.id, 'CREATED', null, item);
      await this.pruneItemHistory(tx);

      return item;
    });
  }

  async createSubtask(dto: CreateSubtaskDto) {
    return this.prisma.kanbanItemSubTask.create({
      data: {
        title: dto.title,
        content: dto.content || 'none', // Fallback for content
        itemId: dto.itemId,
        isDone: dto.isDone || false,
      },
    });
  }

  async updateSubtask(id: number, dto: UpdateSubtaskDto) {
    return this.prisma.kanbanItemSubTask.update({
      where: { id },
      data: dto,
    });
  }

  async removeSubtask(id: number) {
    return this.prisma.kanbanItemSubTask.delete({ where: { id } });
  }

  async updateItem(id: number, dto: UpdateItemDto) {
      const { assignedUsersIds, ...restDto } = dto;

      if (restDto.parentId !== undefined && restDto.parentId === id) {
        throw new BadRequestException('Element nie może być swoim własnym childem.');
      }
      
      const updateData: any = {
        ...restDto,
        deadline: restDto.deadline !== undefined ? this.toDateOrUndefined(restDto.deadline) : undefined,
      };

      if (assignedUsersIds !== undefined) {
          updateData.assignedUsers = {
              set: assignedUsersIds.map(userId => ({ id: userId }))
          };
      }

      return this.prisma.$transaction(async (tx) => {
        const beforeState = await this.getItemSnapshot(tx, id);

        if (!beforeState) {
          throw new NotFoundException(`Nie znaleziono elementu o ID ${id}`);
        }

        const item = await tx.kanbanItem.update({
          where: { id },
          data: updateData,
          include: this.getItemHistoryInclude(),
        });

        await this.createItemHistory(tx, id, 'UPDATED', beforeState, item);
        await this.pruneItemHistory(tx);

        return item;
      });
  }

  async moveBatch(itemIds: number[], targetColumnId: number) {
      return this.prisma.$transaction(async (tx) => {
        const maxOrder = await tx.kanbanItem.findFirst({
          where: { columnId: targetColumnId },
          orderBy: { order: 'desc' },
        });

        let nextOrder = maxOrder ? maxOrder.order + 1 : 0;
        const updatedItems = [];

        for (const id of itemIds) {
          const beforeState = await this.getItemSnapshot(tx, id);

          if (!beforeState) {
            throw new NotFoundException(`Nie znaleziono elementu o ID ${id}`);
          }

          const item = await tx.kanbanItem.update({
            where: { id },
            data: { columnId: targetColumnId, order: nextOrder },
            include: this.getItemHistoryInclude(),
          });

          await this.createItemHistory(tx, id, 'UPDATED', beforeState, item);
          updatedItems.push(item);
          nextOrder++;
        }

        await this.pruneItemHistory(tx);

        return updatedItems;
      });
  }

  async removeItem(id: number) {
    return this.prisma.$transaction(async (tx) => {
      const item = await this.getItemSnapshot(tx, id);

      if (!item) {
        throw new NotFoundException(`Nie znaleziono elementu o ID ${id}`);
      }

      if (item.childs.length > 0) {
        throw new BadRequestException('Nie można usunąć elementu, ponieważ ma przypisane childs.');
      }

      await tx.kanbanItem.delete({ where: { id } });
      await this.createItemHistory(tx, id, 'DELETED', item, null);
      await this.pruneItemHistory(tx);

      return item;
    });
  }

  async getItemHistory(id: number) {
    await this.pruneItemHistory(this.prisma);

    const history = await this.prisma.kanbanItemHistory.findMany({
      where: { itemId: id },
      orderBy: { createdAt: 'desc' },
    });

    return history.map((entry) => ({
      ...entry,
      snapshot: entry.afterState ?? entry.beforeState,
      previousSnapshot: entry.beforeState ?? null,
      currentSnapshot: entry.afterState ?? null,
    }));
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

   async getTime() {
    let dateTime = new Date();
    return dateTime;
  }
}