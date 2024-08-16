import { Controller, Get, HttpException, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ResponseSuccess } from 'src/interface/respone';
import { JwtGuard } from 'src/app/auth/auth.guard';
import { AbsenGuruService } from './absen-guru.service';

@UseGuards(JwtGuard)
@Controller('rekap-guru')
export class AbsenGuruController {
  constructor(private readonly absenGuruService: AbsenGuruService) {}

  @Get('mingguan')
  async getWeeklySummary(
    @Query('month') month: string,
    @Query('week') week: number,
    @Query('mapel') mapel: string,
  ): Promise<ResponseSuccess> {
    return this.absenGuruService.getWeeklySummary(month, week, mapel);
  }
}
