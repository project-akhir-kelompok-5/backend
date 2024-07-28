import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  IsOptional,
  ValidateNested,
  IsArray,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';

class JamDetailDto {
  @IsNotEmpty()
  mapel: number;

  @IsNotEmpty()
  kelas: number;
}

export class CreateJamJadwalDto {
  @IsNotEmpty()
  jam_mulai: string;

  @IsNotEmpty()
  jam_selesai: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JamDetailDto)
  jam_jadwal: JamDetailDto[];
}

class JamJadwalDetailDto {
  @IsInt()
  id: number;

  @IsString()
  mapel: string;

  @IsString()
  kelas: string;
}

export class JamJadwalResponseDto {
  @IsInt()
  id: number;

  @IsString()
  jam_mulai: string;

  @IsString()
  jam_selesai: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JamJadwalDetailDto)
  jam_jadwal: JamJadwalDetailDto[];
}

export class UpdateJamJadwalDto {
  @IsOptional()
  @IsInt()
  mapel?: number;

  @IsOptional()
  @IsInt()
  kelas?: number;

  @IsOptional()
  @IsString()
  jam_mulai?: string;

  @IsOptional()
  @IsString()
  jam_selesai?: string;
}

export class FindAllJamJadwalDto {
  @IsOptional()
  @IsInt()
  mapel?: number;

  @IsOptional()
  @IsInt()
  kelas?: number;
}
