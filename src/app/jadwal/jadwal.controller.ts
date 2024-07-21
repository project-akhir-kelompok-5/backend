// src/app/jadwal/jadwal.controller.ts
import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { JadwalService } from './jadwal.service';
import { CreateJadwalDto } from './jadwal.dto';
import { ResponseSuccess } from 'src/interface/respone';
import { JwtGuard } from '../auth/auth.guard';

@UseGuards(JwtGuard)
@Controller('jadwal')
export class JadwalController {
  constructor(private readonly jadwalService: JadwalService) {}


  @Post('create')
  async create(@Body() createJadwalDto: CreateJadwalDto): Promise<ResponseSuccess> {
    return this.jadwalService.create(createJadwalDto);
  }

  @Get('list')
  async findAll(): Promise<ResponseSuccess> {
    return this.jadwalService.findAll();
  }
}
