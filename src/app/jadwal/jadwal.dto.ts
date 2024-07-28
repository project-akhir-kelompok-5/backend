// src/app/jadwal/jadwal.dto.ts
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsString,
  IsInt,
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';
import { HariEnum } from './jadwal.entity';

class JamDetailDto {
  @IsNotEmpty()
  @IsNumber()
  mapel: number;

  @IsNotEmpty()
  @IsNumber()
  kelas: number;
}

class JamJadwalDto {
  @IsNotEmpty()
  @IsString()
  jam_mulai: string;

  @IsNotEmpty()
  @IsString()
  jam_selesai: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JamDetailDto)
  jam_detail: JamDetailDto[];
}

export class CreateJadwalDto {
  @IsNotEmpty()
  @IsEnum(HariEnum)
  hari: HariEnum;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JamJadwalDto)
  jam_jadwal: JamJadwalDto[];
}

export class UpdateJadwalDto {
  @IsEnum(HariEnum)
  @IsOptional()
  hari?: HariEnum;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JamJadwalDto)
  @IsOptional()
  jam_jadwal?: JamJadwalDto[];

  @IsObject()
  @IsOptional()
  updated_by?: { id: number };
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
