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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KanbanController = void 0;
const common_1 = require("@nestjs/common");
const kanban_service_1 = require("./kanban.service");
const create_column_dto_1 = require("./dto/create-column.dto");
const create_row_dto_1 = require("./dto/create-row.dto");
const create_item_dto_1 = require("./dto/create-item.dto");
const update_item_dto_1 = require("./dto/update-item.dto");
const update_column_dto_1 = require("./dto/update-column.dto");
const update_row_dto_1 = require("./dto/update-row.dto");
let KanbanController = class KanbanController {
    constructor(kanbanService) {
        this.kanbanService = kanbanService;
    }
    findAll() {
        return this.kanbanService.findAll();
    }
    createColumn(createColumnDto) {
        return this.kanbanService.createColumn(createColumnDto);
    }
    updateColumn(id, updateColumnDto) {
        return this.kanbanService.updateColumn(id, updateColumnDto);
    }
    removeColumn(id) {
        return this.kanbanService.removeColumn(id);
    }
    createRow(createRowDto) {
        return this.kanbanService.createRow(createRowDto);
    }
    updateRow(id, updateRowDto) {
        return this.kanbanService.updateRow(id, updateRowDto);
    }
    removeRow(id) {
        return this.kanbanService.removeRow(id);
    }
    createItem(createItemDto) {
        return this.kanbanService.createItem(createItemDto);
    }
    moveBatch(body) {
        return this.kanbanService.moveBatch(body.itemIds, body.targetColumnId);
    }
    updateItem(id, updateItemDto) {
        return this.kanbanService.updateItem(id, updateItemDto);
    }
    removeItem(id) {
        return this.kanbanService.removeItem(id);
    }
    reorderColumns(body) {
        return this.kanbanService.reorderColumns(body.columnIds);
    }
    reorderRows(body) {
        return this.kanbanService.reorderRows(body.rowIds);
    }
};
exports.KanbanController = KanbanController;
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('columns'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_column_dto_1.CreateColumnDto]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "createColumn", null);
__decorate([
    (0, common_1.Patch)('columns/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_column_dto_1.UpdateColumnDto]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "updateColumn", null);
__decorate([
    (0, common_1.Delete)('columns/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "removeColumn", null);
__decorate([
    (0, common_1.Post)('rows'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_row_dto_1.CreateRowDto]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "createRow", null);
__decorate([
    (0, common_1.Patch)('rows/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_row_dto_1.UpdateRowDto]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "updateRow", null);
__decorate([
    (0, common_1.Delete)('rows/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "removeRow", null);
__decorate([
    (0, common_1.Post)('items'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_item_dto_1.CreateItemDto]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "createItem", null);
__decorate([
    (0, common_1.Patch)('items/move-batch'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "moveBatch", null);
__decorate([
    (0, common_1.Patch)('items/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_item_dto_1.UpdateItemDto]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "updateItem", null);
__decorate([
    (0, common_1.Delete)('items/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Patch)('columns/reorder'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "reorderColumns", null);
__decorate([
    (0, common_1.Patch)('rows/reorder'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], KanbanController.prototype, "reorderRows", null);
exports.KanbanController = KanbanController = __decorate([
    (0, common_1.Controller)('kanban'),
    __metadata("design:paramtypes", [kanban_service_1.KanbanService])
], KanbanController);
//# sourceMappingURL=kanban.controller.js.map