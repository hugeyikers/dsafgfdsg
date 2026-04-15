import { IsInt, IsNumber, IsOptional, IsString, ValidateIf, IsArray } from 'class-validator';

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
    order?: number;

    @ValidateIf((object, value) => value !== null)
    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    assignedUsersIds?: number[];

    @IsString()
    @IsOptional()
    color?: string;
}