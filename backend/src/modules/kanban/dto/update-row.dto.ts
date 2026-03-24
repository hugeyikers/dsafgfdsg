import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRowDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsNumber()
    @IsOptional()
    limit?: number;

    @IsNumber()
    @IsInt()
    @IsOptional()
    order?: number;
  }
  