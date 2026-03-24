import { IsInt, IsNotEmpty, IsNumber, IsString, IsOptional, ValidateIf } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsInt()
  columnId: number;

  @IsNumber()
  @IsInt()
  @IsOptional()
  rowId?: number;

  @ValidateIf((object, value) => value !== null)
  @IsNumber()
  @IsInt()
  @IsOptional()
  assignedToId?: number | null;
}
