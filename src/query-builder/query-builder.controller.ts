import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/app/auth/auth.guard';
import { QueryBuilderService } from './query-builder.service';
import { Pagination } from 'src/utils/decorator/pagination.decorator';
import { latihanQueryBuilderDto } from './query-builder.dto';

// @UseGuards(JwtGuard)
@Controller('query-builder')
export class QueryBuilderController {
  constructor(private readonly querybuilderService: QueryBuilderService) {}
  @Get('/latihan')
  async LatihanController(@Pagination() query: latihanQueryBuilderDto) {
    return this.querybuilderService.latihan(query);
  }

  // @Get('/latihan2')
  // async LatihanController2(@Pagination() query: latihanQueryBuilderDto) {
  //   return this.querybuilderService.latihan2(query);
  // }
}