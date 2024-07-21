// src/app/mapel/dto/create-mapel.dto.ts
import { IsString, IsNotEmpty, Length, IsOptional, IsObject } from 'class-validator';

export class CreateMapelDto {
  @IsString()
  @IsNotEmpty()
  nama_mapel: string;
  
  @IsObject()
  @IsOptional()
  created_by: { id: number };
}

export class UpdateMapelDto {
  @IsString()
  @IsNotEmpty()
  nama_mapel: string;
  
  @IsObject()
  @IsOptional()
  updated_by: { id: number };
}
