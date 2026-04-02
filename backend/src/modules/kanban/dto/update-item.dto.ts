import { IsInt, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

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

    // TUTAJ BYŁ BŁĄD! Brakowało ValidateIf dla null.
    @ValidateIf((object, value) => value !== null)
    @IsInt()
    @IsOptional()
    rowId?: number | null;

    @IsNumber()
    @IsInt()
    @IsOptional()
    order?: number;

    @ValidateIf((object, value) => value !== null)
    @IsInt()
    @IsOptional()
    assignedToId?: number | null;

    @IsString()
    @IsOptional()
    color?: string;
}