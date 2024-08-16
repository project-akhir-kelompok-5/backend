// src/app/jadwal/jadwal.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
  Put,
  Delete,
  Param,
  Req,
} from '@nestjs/common';
import { JadwalService } from './jadwal.service';
import {
  CreateJadwalDto,
  FindAllJadwalDTO,
  UpdateJadwalDto,
} from './jadwal.dto';
import { ResponseSuccess } from 'src/interface/respone';
import { JwtGuard } from '../auth/auth.guard';
import { query } from 'express';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { Role } from '../auth/roles.enum';
import { RolesGuard } from '../auth/roles.guard';

@UseGuards(JwtGuard, RolesGuard)
@Controller('jadwal')
export class JadwalController {
  constructor(private readonly jadwalService: JadwalService) {}

  @Get('hari-ini-siswa')
  async getCurrentJamDetailSiswa() {
    return this.jadwalService.getCurrentJamDetailIdSiswa();
  }

  @Get('hari-ini-guru')
  async getCurrentJamDetailGuru() {
    return this.jadwalService.getCurrentJamDetailIdGuru();
  }

  @Post('create')
  // @Roles(Role.ADMIN, Role.GURU)
  async create(
    @Body() createJadwalDto: CreateJadwalDto,
  ): Promise<ResponseSuccess> {
    return this.jadwalService.create(createJadwalDto);
  }

  @Get('list')
  // @Roles(Role.ADMIN)
  async findAll(@Query() query: FindAllJadwalDTO): Promise<ResponseSuccess> {
    return this.jadwalService.findAll(query);
  }

  @Put('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateJadwalDto: UpdateJadwalDto,
  ): Promise<ResponseSuccess> {
    return this.jadwalService.update(+id, updateJadwalDto);
  }

  @Get('detail/:id')
  async findOne(@Param('id') id: string): Promise<ResponseSuccess> {
    return this.jadwalService.findOne(+id);
  }

  @Delete('delete/:id')
  // @Roles(Role.ADMIN)
  async delete(@Param('id') id: number): Promise<ResponseSuccess> {
    return this.jadwalService.delete(id);
  }

  @Delete('delete-bulk')
  async deleteBulk(@Body('data') data: number[]): Promise<ResponseSuccess> {
    return this.jadwalService.deleteBulk(data);
  }
}
