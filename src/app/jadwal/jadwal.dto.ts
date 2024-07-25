// src/app/jadwal/jadwal.dto.ts
import {
  IsEnum,
  IsString,
  IsInt,
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';

export class CreateJadwalDto {
  @IsNumber()
  mapel: number;

  @IsNumber()
  kelas: number;

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
  mapel: number;

  @IsNumber()
  kelas: number;

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

export class FindAllJadwalDTO extends PageRequestDto {
  @IsOptional()
  @IsString()
  hari: string;

  @IsOptional()
  @IsString()
  kelas: string;

  @IsOptional()
  @IsString()
  mapel: string;
}
