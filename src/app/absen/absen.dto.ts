import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsDate, IsNumber, IsObject, IsOptional } from 'class-validator';


export class CreateAbsenDto {
  @IsNotEmpty()
  @IsNumber()
  jadwal: number;
}


export class UpdateAbsenDto extends PartialType(CreateAbsenDto) {}
