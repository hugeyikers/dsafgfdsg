import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsInt()
  columnId: number;
}
