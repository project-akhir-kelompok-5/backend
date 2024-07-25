// src/app/auth/auth.dto/create-student.dto.ts
import { IsNotEmpty, IsString, IsDateString, IsNumber } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  nama: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsNumber()
  kelas: number;

  @IsNotEmpty()
  @IsString()
  NISN: string;

  @IsNotEmpty()
  @IsDateString()
  tanggal_lahir: string;

  @IsNotEmpty()
  @IsString()
  alamat: string;
}
