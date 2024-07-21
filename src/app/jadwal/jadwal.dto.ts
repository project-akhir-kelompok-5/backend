// src/app/jadwal/jadwal.dto.ts
import { IsEnum, IsString, IsInt, IsDateString, IsNumber, IsObject, IsOptional } from 'class-validator';

export class CreateJadwalDto {
  @IsNumber()
  mapel_id: number;

  @IsNumber()
  kelas_id: number;

  @IsEnum(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'])
  hari: string;

  @IsString()
  jam_mulai: string;

  @IsString()
  jam_selesai: string;

  @IsObject()
  @IsOptional()
  created_by: { id: number };
}

export class UpdateJadwalDto {
  @IsNumber()
  mapel_id: number;

  @IsNumber()
  kelas_id: number;

  @IsEnum(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'])
  hari: string;

  @IsString()
  jam_mulai: string;

  @IsString()
  jam_selesai: string;

  @IsObject()
  @IsOptional()
  updated_by: { id: number };
}
