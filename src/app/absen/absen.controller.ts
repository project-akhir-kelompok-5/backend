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
import { CreateAbsenDto, FilterAbsenDto, UpdateAbsenDto } from './absen.dto';
import BaseResponse from 'src/utils/response/base.response';
import { JwtGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Request, Response } from 'express';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { Role } from '../auth/roles.enum';
import { ResponseSuccess } from 'src/interface/respone';

@UseGuards(JwtGuard, RolesGuard)
@Controller('absen')
export class AbsenController extends BaseResponse {
  constructor(private readonly absenService: AbsenService) {
    super();
  }

  @Post('masuk')
  async create(@Body() payload: CreateAbsenDto) {
    return await this.absenService.createAbsen(payload);
  }

  // @Get('list-filter')
  // async findAllWithFIlter(@Query() query: any) {
  //   return await this.absenService.getAbsenListWIthFilter(query);
  // }

  @Get('list')
  async findAll() {
    return await this.absenService.list();
  }

  @Get('list-kelas/:id')
  async findAllFilterKElas(@Param('id') id: number) {
    return await this.absenService.listFilterKelas(id);
  }

  @Post('test-socket')
  async testSocket() {
    return this.absenService.testSocket();
  }

  // @Post('exit/:jadwal_id')
  // async logExit(
  //   @Param('jadwal_id') jadwal_id: number,
  //   @Body('hasil_jurnal_kegiatan') hasil_jurnal_kegiatan: string,
  // ): Promise<ResponseSuccess> {
  //   return this.absenService.logExit(jadwal_id, hasil_jurnal_kegiatan);
  // }

  @Put('update/:id')
  async update(
    @Param('id') id: number,
    @Body() updateAbsenDto: UpdateAbsenDto,
  ) {
    return await this.absenService.update(id, updateAbsenDto);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: number) {
    return await this.absenService.delete(id);
  }
}
