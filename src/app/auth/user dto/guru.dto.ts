import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';
export class RegisterGuruDto {
  @IsNotEmpty()
  @IsString()
  nama: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  jurnal_kegiatan?: string;

  @IsInt()
  @IsNotEmpty()
  kelas: number;

  @IsInt()
  @IsNotEmpty()
  mapel: number;
}
