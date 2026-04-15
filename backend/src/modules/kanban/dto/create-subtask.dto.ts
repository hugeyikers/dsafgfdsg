import { IsInt, IsNotEmpty, IsNumber, IsString, IsBoolean, IsOptional} from 'class-validator';

export class CreateSubtaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsNumber()
    @IsInt()
    itemId: number;

    @IsBoolean()
    @IsNotEmpty()
    @IsOptional()
    isDone: boolean;
}