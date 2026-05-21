import { IsInt, IsNotEmpty, IsNumber, IsString, IsOptional, ValidateIf, IsArray, IsDateString, IsBoolean, IsEnum } from 'class-validator';

enum Size {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

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

  @IsNumber()
  @IsInt()
  @IsOptional()
  parentId?: number | null;

  @ValidateIf((object, value) => value !== null)
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  assignedUsersIds?: number[];

  @IsString()
  @IsOptional()
  color?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsEnum(Size)
  @IsOptional()
  size?: Size = Size.M;

  @IsBoolean()
  @IsOptional()
  archived?: boolean = false;
}