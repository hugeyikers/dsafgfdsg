import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateRowDto } from './dto/create-row.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { UpdateRowDto } from './dto/update-row.dto';

@Controller('kanban')
export class KanbanController {
  constructor(private readonly kanbanService: KanbanService) {}

  @Get('all')
  findAll() {
    return this.kanbanService.findAll();
  }

  @Post('columns')
  createColumn(@Body() createColumnDto: CreateColumnDto) {
    return this.kanbanService.createColumn(createColumnDto);
  }

  @Patch('columns/:id')
  updateColumn(@Param('id', ParseIntPipe) id: number, @Body() updateColumnDto: UpdateColumnDto) {
    return this.kanbanService.updateColumn(id, updateColumnDto);
  }

  @Delete('columns/:id')
  removeColumn(@Param('id', ParseIntPipe) id: number) {
    return this.kanbanService.removeColumn(id);
  }

  @Post('rows')
  createRow(@Body() createRowDto: CreateRowDto) {
    return this.kanbanService.createRow(createRowDto);
  }

  @Patch('rows/:id')
  updateRow(@Param('id', ParseIntPipe) id: number, @Body() updateRowDto: UpdateRowDto) {
    return this.kanbanService.updateRow(id, updateRowDto);
  }

  @Delete('rows/:id')
  removeRow(@Param('id', ParseIntPipe) id: number) {
    return this.kanbanService.removeRow(id);
  }

  @Post('items')
  createItem(@Body() createItemDto: CreateItemDto) {
    return this.kanbanService.createItem(createItemDto);
  }

  @Patch('items/move-batch')
  moveBatch(@Body() body: { itemIds: number[], targetColumnId: number }) {
      return this.kanbanService.moveBatch(body.itemIds, body.targetColumnId);
  }

  @Patch('items/:id')
  updateItem(@Param('id', ParseIntPipe) id: number, @Body() updateItemDto: UpdateItemDto) {
    return this.kanbanService.updateItem(id, updateItemDto);
  }

  @Delete('items/:id')
  removeItem(@Param('id', ParseIntPipe) id: number) {
    return this.kanbanService.removeItem(id);
  }

  @Patch('columns/reorder')
  reorderColumns(@Body() body: { columnIds: number[] }) {
    return this.kanbanService.reorderColumns(body.columnIds);
  }

  @Patch('rows/reorder')
  reorderRows(@Body() body: { rowIds: number[] }) {
    return this.kanbanService.reorderRows(body.rowIds);
  }
}

