import { IsNotEmpty, IsInt, IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

export class CreateRowDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  color?: string;
}
