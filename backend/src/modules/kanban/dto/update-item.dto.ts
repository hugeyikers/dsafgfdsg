import { IsInt, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateItemDto {
    @IsString()
    @IsOptional()
    content?: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsNumber()
    @IsInt()
    @IsOptional()
    columnId?: number;

    @IsInt()
    @IsOptional()
    rowId?: number;

    @IsNumber()
    @IsInt()
    @IsOptional()
    order?: number;

    @ValidateIf((object, value) => value !== null)
    @IsInt()
    @IsOptional()
    assignedToId?: number | null;

    @IsString()
    @IsOptional()
    color?: string;
  }
  