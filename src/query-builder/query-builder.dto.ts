import { IsOptional, IsString } from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';

export class latihanQueryBuilderDto extends PageRequestDto {
  @IsString()
  @IsOptional()
  nama: string;

  @IsString()
  @IsOptional()
  nama_produk: string;

  @IsString()
  @IsOptional()
  stok: string;
  
  @IsOptional()
  @IsString()
  role: string;
}