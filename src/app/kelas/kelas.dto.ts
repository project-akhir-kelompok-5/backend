// src/app/kelas/create-kelas.dto.ts
import { IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateKelasDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  nama_kelas: string;

  @IsObject()
  @IsOptional()
  created_by: { id: number };
}

export class UpdateKelasDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  nama_kelas: string;

  @IsObject()
  @IsOptional()
  updated_by: { id: number };
}
