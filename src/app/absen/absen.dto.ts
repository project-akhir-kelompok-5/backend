import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, IsDate, IsNumber, IsObject, IsOptional, IsInt } from 'class-validator';


export class CreateAbsenDto {
  @IsInt()
  readonly jam_detail: number;
}


export class FilterAbsenDto {
  @IsString()
  readonly mapel: string;

  @IsString()
  readonly kelas: string;
}


export class UpdateAbsenDto extends PartialType(CreateAbsenDto) {}
