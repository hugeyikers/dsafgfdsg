import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateColumnDto {
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

    @IsString()
    @IsOptional()
    color?: string;
  }
  