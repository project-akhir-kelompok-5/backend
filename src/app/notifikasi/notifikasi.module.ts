import { Module } from '@nestjs/common';
import {  PushNotificationService } from './notifikasi.service';

@Module({
  exports: [PushNotificationService],
  providers: [PushNotificationService]
})
export class NotifikasiModule {}
