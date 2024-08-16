import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AbsenService } from './absen.service';
import {
  CreateAbsenGuruDto,
  CreateAbsenSiswaDto,
  CreateEnterClassGuruDto,
  CreateJurnalKegiatanDto,
  FilterAbsenDto,
} from './absen.dto';
import BaseResponse from 'src/utils/response/base.response';
import { JwtGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Request, Response } from 'express';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { Role } from '../auth/roles.enum';
import { ResponseSuccess } from 'src/interface/respone';
import { AbsenGateway } from './absen.gateway';
import { AbsenSiswaService } from './absen-siswa/absen-siswa.service';
import { AbsenGuruService } from './absen-guru/absen-guru.service';

@Controller('absen')
export class AbsenController extends BaseResponse {
  constructor(
    private readonly absenService: AbsenService,
    private readonly absenSiswaService: AbsenSiswaService,
    private readonly absenGuruService: AbsenGuruService,
  ) {
    super();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.GURU)
  @Post('masuk-guru')
  async createAbsenGuru(@Body() payload: CreateAbsenGuruDto) {
    return await this.absenGuruService.AbsenGuru(payload);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.GURU)
  @Post('masuk-kelas-guru')
  async enterClassGuru(@Body() payload: CreateEnterClassGuruDto) {
    return await this.absenService.enterClassGuru(payload);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.GURU)
  @Post('keluar-kelas/:id')
  async keluarKelasGuru(
    @Param('id') id: string,
    @Body() createJurnalKegiatanDto: CreateJurnalKegiatanDto,
  ): Promise<ResponseSuccess> {
    return this.absenService.keluarKelasGuru(createJurnalKegiatanDto, +id);
  }


  @UseGuards(JwtGuard, RolesGuard)
  @Delete('delete-kelas/:id')
  async deleteABsenkelas(@Param('id') id: string): Promise<ResponseSuccess> {
    return this.absenService.deleteAbsenKelas(+id);
  }

  @Get('detail-kelas-absen/:id')
  async detailAbsenKElas(@Param('id') id: string): Promise<ResponseSuccess> {
    return this.absenService.getAbsenKelasDetail(+id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.Murid)
  @Post('masuk-siswa')
  async createAbsenSiswa(@Body() payload: CreateAbsenSiswaDto) {
    return await this.absenSiswaService.AbsenSiswa(payload);
  }

  @Get('list')
  async findAll() {
    return await this.absenService.list();
  }

  @Get('list-absen-kelas')
  async findAllFilterKElas() {
    return await this.absenService.listAbsenKelas();
  }

  // @Post('test-socket')
  // async testSocket() {
  //   return this.absenService.testSocket();
  // }

  // @Put('update/:id')
  // async update(
  //   @Param('id') id: number,
  //   @Body() updateAbsenDto: UpdateAbsenDto,
  // ) {
  //   return await this.absenService.update(id, updateAbsenDto);
  // }

  @Delete('delete/:id')
  async delete(@Param('id') id: number) {
    return await this.absenService.delete(id);
  }
}
