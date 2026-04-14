import { IsInt, IsNotEmpty, IsNumber, IsString, IsOptional, ValidateIf, IsArray } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsInt()
  columnId: number;

  @IsNumber()
  @IsInt()
  @IsOptional()
  rowId?: number | null;

  @ValidateIf((object, value) => value !== null)
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  assignedUsersIds?: number[];

  @IsString()
  @IsOptional()
  color?: string;
}