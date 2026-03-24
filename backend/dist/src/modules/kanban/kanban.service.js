"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanbanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let KanbanService = class KanbanService {
    constructor(prisma) {
        this.prisma = prisma;
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
                    include: { assignedTo: true },
                },
            },
            orderBy: { order: 'asc' },
        });
        const rows = await this.prisma.kanbanRow.findMany({
            orderBy: { order: 'asc' },
        });
        return { columns, rows };
    }
    async createColumn(dto) {
        const maxOrder = await this.prisma.kanbanColumn.findFirst({ orderBy: { order: 'desc' } });
        const order = maxOrder ? maxOrder.order + 1 : 0;
        return this.prisma.kanbanColumn.create({
            data: Object.assign(Object.assign({}, dto), { order }),
            include: { items: true },
        });
    }
    async updateColumn(id, dto) {
        return this.prisma.kanbanColumn.update({
            where: { id },
            data: dto,
            include: { items: true },
        });
    }
    async removeColumn(id) {
        return this.prisma.kanbanColumn.delete({ where: { id } });
    }
    async createRow(dto) {
        const maxOrder = await this.prisma.kanbanRow.findFirst({ orderBy: { order: 'desc' } });
        const order = maxOrder ? maxOrder.order + 1 : 0;
        return this.prisma.kanbanRow.create({
            data: Object.assign(Object.assign({}, dto), { order }),
            include: { items: true },
        });
    }
    async updateRow(id, dto) {
        return this.prisma.kanbanRow.update({
            where: { id },
            data: dto,
            include: { items: true },
        });
    }
    async removeRow(id) {
        return this.prisma.kanbanRow.delete({ where: { id } });
    }
    async createItem(dto) {
        const maxOrder = await this.prisma.kanbanItem.findFirst({
            where: { columnId: dto.columnId },
            orderBy: { order: 'desc' }
        });
        const order = maxOrder ? maxOrder.order + 1 : 0;
        return this.prisma.kanbanItem.create({
            data: {
                title: dto.content,
                content: dto.content,
                columnId: dto.columnId,
                rowId: dto.rowId || null,
                assignedToId: dto.assignedToId || null,
                order
            },
            include: { assignedTo: true },
        });
    }
    async updateItem(id, dto) {
        return this.prisma.kanbanItem.update({
            where: { id },
            data: dto,
            include: { assignedTo: true }
        });
    }
    async moveBatch(itemIds, targetColumnId) {
        const maxOrder = await this.prisma.kanbanItem.findFirst({
            where: { columnId: targetColumnId },
            orderBy: { order: 'desc' }
        });
        let nextOrder = maxOrder ? maxOrder.order + 1 : 0;
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
    async removeItem(id) {
        return this.prisma.kanbanItem.delete({ where: { id } });
    }
    async reorderColumns(columnIds) {
        const updates = columnIds.map((id, index) => this.prisma.kanbanColumn.update({
            where: { id },
            data: { order: index },
        }));
        return await this.prisma.$transaction(updates);
    }
    async reorderRows(rowIds) {
        const updates = rowIds.map((id, index) => this.prisma.kanbanRow.update({
            where: { id },
            data: { order: index },
        }));
        return await this.prisma.$transaction(updates);
    }
};
exports.KanbanService = KanbanService;
exports.KanbanService = KanbanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KanbanService);
//# sourceMappingURL=kanban.service.js.map