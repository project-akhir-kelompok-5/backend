import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BookService } from './book.service';
import {
  CreateBookDto,
  FindBookDto,
  UpdateBookDto,
  createBookArrayDto,
  deleteBookArrayDto,
} from './book.dto';
import { ResponseSuccess } from 'src/interface/respone';
import { Pagination } from 'src/utils/decorator/pagination.decorator';
// import { title } from 'process';

@Controller('book')
export class BookController {
  constructor(private booksService: BookService) {}

  // @Get('list')
  // findAllBook() {
  //   return this.booksService.getAllBooks();
  // }

  @Get('/list')
  findAllBook(@Pagination() findBookDto: FindBookDto) {
    console.log('query', findBookDto);
    return this.booksService.getAllBooks(findBookDto);
  }

  @Get('detail/:id')
  findOneBook(@Param('id') id: string) {
    return this.booksService.getDetail(Number(id));
  }

  @Post('/create')
  createBook(@Body() payload: CreateBookDto) {
    return this.booksService.createBook(payload);
  }

  @Post('/create/bulk')
  bulkCreateBook(@Body() payload: createBookArrayDto) {
    return this.booksService.bulkCreate(payload);
  }

  // @Post('/delete/bulk')
  // bulkDeleteBook(@Body() payload: createBookArrayDto) {
  //   return this.booksService.bulkDelete(payload);
  // }

  @Post('/delete/bulk')
  async bulkDelete(
    @Body() payload: deleteBookArrayDto,
  ): Promise<ResponseSuccess> {
    const result = await this.booksService.bulkDelete(payload);

    return result;
  }

  // @Post('create')
  // createBook(
  //   @Body('title') title: string,
  //   @Body('author') author: string,
  //   @Body('year') year: number,
  // ) {
  //   return this.booksService.createBook(title, author, year);
  // }

  @Put('update/:id')
  updateBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.updateBook(Number(id), updateBookDto);
  }

  // @Put('update/:id')
  // updateBook(
  //   @Param('id') id: string,
  //   @Body('title') title: string,
  //   @Body('author') author: string,
  //   @Body('year') year: number,
  // ) {
  //   return this.booksService.updateBook(Number(id), title, author, year);
  // }

  // @Delete('delete/:id')
  // deleteBook(@Param('id') id: string) {
  //   return this.booksService.deleteBook(+id);
  // }

  @Delete('delete/:id')
  deleteBook(@Param('id') id: number) {
    return this.booksService.deleteBook(Number(id));
  }
}
