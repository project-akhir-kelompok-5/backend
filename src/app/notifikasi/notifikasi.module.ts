import { Module } from '@nestjs/common';
import { NotifikasiService } from './notifikasi.service';

@Module({
  exports: [NotifikasiService],
  providers: [NotifikasiService]
})
export class NotifikasiModule {}
