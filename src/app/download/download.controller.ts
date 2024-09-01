import { Controller, Get, Res } from '@nestjs/common';
import { DownloadService } from './download.service';
import * as path from 'path';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Controller('download')
export class DownloadController {
  constructor(private readonly donwloadService: DownloadService) {}

  @Get('pdf')
  downloadAttendanceReport(@Res() response: Response) {
    return this.donwloadService.generateAttendanceReport(response);
  }
}
