import { IsInt, IsOptional, IsNumber, IsString, IsBoolean} from 'class-validator';

export class UpdateSubtaskDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsBoolean()
    @IsOptional()
    isDone?: boolean;
}