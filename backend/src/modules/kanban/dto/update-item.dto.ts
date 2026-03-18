import { IsInt, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateItemDto {
    @IsString()
    @IsOptional()
    content?: string;

    @IsNumber()
    @IsInt()
    @IsOptional()
    columnId?: number;

    @IsNumber()
    @IsInt()
    @IsOptional()
    order?: number;

    @ValidateIf((object, value) => value !== null)
    @IsInt()
    @IsOptional()
    assignedToId?: number | null;
  }
  