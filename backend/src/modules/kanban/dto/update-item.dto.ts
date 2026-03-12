import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

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
  }
  