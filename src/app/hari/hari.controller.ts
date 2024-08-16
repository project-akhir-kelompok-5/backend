// src/app/hari/hari.controller.ts
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { HariService } from './hari.service';
import { Hari } from './hari.entity';
import { JwtGuard } from '../auth/auth.guard';
import { ResponseSuccess } from 'src/interface/respone';

@UseGuards(JwtGuard)
@Controller('hari')
export class HariController {
  constructor(private readonly hariService: HariService) {}

  @Post('create-bulk')
  async createBulk(): Promise<Hari[]> {
    return this.hariService.createBulk();
  }

  @Get('list')
  async list(): Promise<ResponseSuccess> {
    return this.hariService.list();
  }
}
