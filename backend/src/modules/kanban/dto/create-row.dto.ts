import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRowDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
