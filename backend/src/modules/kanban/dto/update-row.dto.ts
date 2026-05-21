import { IsInt, IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

export class UpdateRowDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsInt()
    @IsOptional()
    limit?: number;

    @IsInt()
    @IsOptional()
    order?: number;

    @IsString()
    @IsOptional()
    color?: string;
  }
  