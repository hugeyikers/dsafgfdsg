import { IsInt, IsNotEmpty, IsNumber, IsString, IsBoolean} from 'class-validator';

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
    isDone: boolean;
}