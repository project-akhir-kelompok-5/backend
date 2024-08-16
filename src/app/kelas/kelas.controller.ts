// src/app/kelas/kelas.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { KelasService } from './kelas.service';
import { ResponseSuccess } from 'src/interface/respone';
import { BulkCreateKelasDto, CreateKelasDto } from './kelas.dto';
import { InjectCreatedBy } from 'src/utils/decorator/createByDecorator';
import { JwtGuard } from '../auth/auth.guard';

@UseGuards(JwtGuard)
@Controller('kelas')
export class KelasController {
  constructor(private readonly kelasService: KelasService) {}

  @Post('create')
  async create(
    @Body() createKelasDto: CreateKelasDto,
  ): Promise<ResponseSuccess> {
    return this.kelasService.create(createKelasDto);
  }

  @Get('list')
  async findAll(@Req() req): Promise<ResponseSuccess> {
    // const { id } = req.user;
    console.log('req', req.user);
    return this.kelasService.findAll();
  }

  @Put('update/:id')
  async update(
    @Param('id') id: number,
    @Body() updateKelasDto: CreateKelasDto,
  ): Promise<ResponseSuccess> {
    return this.kelasService.update(id, updateKelasDto);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: number): Promise<ResponseSuccess> {
    return this.kelasService.delete(id);
  }

  @Delete('delete-bulk')
  async deleteBulk(@Query('ids') ids: string): Promise<ResponseSuccess> {
    const idsArray = ids.split(',').map((id) => parseInt(id, 10));
    return this.kelasService.deleteBulk(idsArray);
  }

  @Get('detail/:id')
  async getKelasDetail(@Param('id') id: number): Promise<ResponseSuccess> {
    return this.kelasService.findOneWithStudents(id);
  }

  @Post('create/bulk')
  async createBulk(@Body() bulkCreateKelasDto: BulkCreateKelasDto): Promise<ResponseSuccess> {
    return this.kelasService.createBulk(bulkCreateKelasDto);
  }
}
