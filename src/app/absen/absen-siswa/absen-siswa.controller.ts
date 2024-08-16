import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { AbsenSiswaService } from './absen-siswa.service';
import { ResponseSuccess } from 'src/interface/respone';
import { JwtGuard } from 'src/app/auth/auth.guard';

@UseGuards(JwtGuard)
@Controller('rekap-siswa')
export class AbsenSiswaController {
  constructor(private readonly absenSiswaService: AbsenSiswaService) {}

  @Get('mingguan')
  async getWeeklySummary(
    @Query('month') month: string,
    @Query('week') week: number,
    @Query('mapel') mapel: string,
  ): Promise<ResponseSuccess> {
    return this.absenSiswaService.getWeeklySummary(month, week, mapel);
  }
}
