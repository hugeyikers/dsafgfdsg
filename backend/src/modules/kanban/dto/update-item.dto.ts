import { IsInt, IsNumber, IsOptional, IsString, ValidateIf, IsArray, IsDateString, IsEnum, IsBoolean } from 'class-validator';

enum Size {
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
}

export class UpdateItemDto {
    @IsString()
    @IsOptional()
    content?: string;

    @IsString()
    @IsOptional()
    title?: string;

    @ValidateIf((object, value) => value !== null)
    @IsNumber()
    @IsInt()
    @IsOptional()
    columnId?: number | null;

    @ValidateIf((object, value) => value !== null)
    @IsInt()
    @IsOptional()
    rowId?: number | null;

    @IsNumber()
    @IsInt()
    @IsOptional()
    parentId?: number | null;

    @IsNumber()
    @IsInt()
    @IsOptional()
    order?: number;

    @ValidateIf((object, value) => value !== null)
    @IsArray()
    @IsInt({ each: true })
    @ValidateIf((object, value) => value !== null)
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
    archived?: boolean;
}