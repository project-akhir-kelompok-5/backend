// import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
// import { JamJadwalService } from './jam-jadwal.service';
// import { CreateJamJadwalDto, UpdateJamJadwalDto, FindAllJamJadwalDto } from './jam-jadwal.dto';
// import { JwtGuard } from '../auth/auth.guard';

// @UseGuards(JwtGuard)
// @Controller('jam-jadwal')
// export class JamJadwalController {
//   constructor(private readonly jamJadwalService: JamJadwalService) {}

//   @Post('create')
//   async create(@Body() pay: CreateJamJadwalDto) {
//     return this.jamJadwalService.create(pay);
//   }

//   @Get('list')
//   async findAll() {
//     return this.jamJadwalService.findAll();
//   }

// //   @Put('update/:id')
// //   async update(@Param('id') id: number, @Body() updateJamJadwalDto: UpdateJamJadwalDto) {
// //     return this.jamJadwalService.update(id, updateJamJadwalDto);
// //   }

//   @Delete('delete/:id')
//   async delete(@Param('id') id: number) {
//     return this.jamJadwalService.delete(id);
//   }

//   @Delete('delete-bulk')
//   async deleteBulk(@Body() ids: number[]) {
//     return this.jamJadwalService.deleteBulk(ids);
//   }
// }
