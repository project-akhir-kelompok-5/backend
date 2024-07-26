import { IsNotEmpty, IsString, IsOptional, IsInt, IsNumber, IsArray } from 'class-validator';
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


  @IsNotEmpty()
  mapel: any;
}

export class UpdateGuruDto {
  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  nomor_hp?: string;

}

export class DeleteBulkGuruDto {
  @IsArray()
  @IsNumber({}, { each: true })
  data: number[];
}

export class GuruProfileDto {
  id: number;
  nama: string;
  email: string;
  mapel: {
    id: number;
    nama_mapel: string; // Adjust this based on the Mapel entity structure
  }[];
  created_at: Date;
  updated_at: Date;
}