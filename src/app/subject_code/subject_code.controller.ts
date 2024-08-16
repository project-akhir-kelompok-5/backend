// src/app/subject_code/subject_code.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SubjectCodeService } from './subject_code.service';
import { ResponseSuccess } from 'src/interface/respone';
import { JwtGuard } from '../auth/auth.guard';

@UseGuards(JwtGuard)
@Controller('subject-code')
export class SubjectCodeController {
  constructor(private readonly subjectCodeService: SubjectCodeService) {}

  @Get('list')
  async findAll(): Promise<ResponseSuccess> {
    return this.subjectCodeService.findAll();
  }
}
