import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponsePagination, ResponseSuccess } from 'src/interface/respone';
import { Repository } from 'typeorm';
import { Book } from './book.entity';
import {
  CreateBookDto,
  UpdateBookDto,
  FindBookDto,
  deleteBookArrayDto,
} from './book.dto';
import { createBookArrayDto } from './book.dto';
import { Like } from 'typeorm';
import { Between } from 'typeorm';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
  ) {}

  private books: {
    id?: number;
    title: string;
    author: string;
    year: number;
  }[] = [
    {
      id: 1,
      title: 'HTML CSS',
      author: 'Muhammad Rajwaa',
      year: 2023,
    },
  ];
  // getAllBooks(): ResponseSuccess {
  //   return {
  //     status: 'success',
  //     message: 'List Buku Ditemukan',
  //     data: this.books,
  //   };
  // }

  async getAllBooks(query: FindBookDto): Promise<ResponsePagination> {
    console.log('query', query);
    const { page, pageSize, limit, title, author, from_year, to_year } = query;

    const filter: {
      [key: string]: any;
    } = {};

    if (title) {
      filter.title = Like(`%${title}%`);
    }
    if (author) {
      filter.author = Like(`%${author}%`);
    }

    if (from_year && to_year) {
      filter.year = Between(from_year, to_year);
    }

    if (from_year && !!to_year === false) {
      filter.year = Between(from_year, from_year);
    }
    console.log('filter', filter);

    const total = await this.bookRepository.count({
      where: filter,
    });

    const result = await this.bookRepository.find({
      where: filter,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    return {
      status: 'Success',
      message: 'List Buku ditermukan',
      data: result,
      pagination: {
        total: total,
        page: Number(page),
        pageSize: Number(pageSize),
        total_page: Math.ceil(total / pageSize),
      },
    };
  }

  // async getAllBooks(): Promise<ResponseSuccess> {
  //   const result = await this.bookRepository.find();
  //   return {
  //     status: 'Success',
  //     message: 'List Buku ditemukan',
  //     data: book,
  //   };
  // }

  // getAllBooks(): ResponseSuccess {
  //   return {
  //     status: 'Success',
  //     message: 'List Buku Ditemukan',
  //     data: this.books,
  //   };
  // }

  // getAllBooks(): {
  //   id?: number;
  //   title: string;
  //   author: string;
  //   year: number;
  // }[] {
  //   return this.books;
  // }

  private findBookById(id: number): number {
    const bookIndex = this.books.findIndex((book) => book.id === id);

    if (bookIndex === -1) {
      throw new NotFoundException(`Buku dengan Id ${id} tidak dapat ditemukan`);
    }
    return bookIndex;
  }

  async getDetail(id: number): Promise<ResponseSuccess> {
    const detailBook = await this.bookRepository.findOne({
      where: {
        id,
      },
    });

    if (detailBook === null) {
      throw new NotFoundException(`Buku dengan id ${id} tidak ditemukan`);
    }
    return {
      status: 'Success',
      message: 'Detail Buku ditermukan',
      data: detailBook,
    };
  }

  // getDetail(id: number): ResponseSuccess {
  //   const bookIndex = this.findBookById(id);
  //   const book = this.books[bookIndex];
  //   return {
  //     status: 'Succes',
  //     message: 'List Buku ditemukan',
  //     data: book,
  //   };
  // }

  // getDetail(id: number): {
  //   id?: number;
  //   title: string;
  //   author: string;
  //   year: number;
  // } {
  //   const bookIndex = this.findBookById(id);
  //   const book = this.books[bookIndex];

  //   return book;
  // }

  async bulkCreate(payload: createBookArrayDto): Promise<ResponseSuccess> {
    try {
      let berhasil = 0;
      let gagal = 0;
      await Promise.all(
        payload.data.map(async (data) => {
          try {
            await this.bookRepository.save(data);

            berhasil += 1;
          } catch {
            gagal += 1;
          }
        }),
      );

      return this._success(`Berhasil menyimpan ${berhasil} dan gagal ${gagal}`);
    } catch {
      throw new HttpException('Ada Kesalahan', HttpStatus.BAD_REQUEST);
    }
  }

  private _success(message: string, data?: any): ResponseSuccess {
    return {
      status: 'Success',
      message: message,
      data: data,
    };
  }

  async createBook(createBookDto: CreateBookDto): Promise<ResponseSuccess> {
    const { title, author, year } = createBookDto;

    try {
      await this.bookRepository.save({
        title: title,
        author: author,
        year: year,
      });
      return {
        status: 'Success',
        message: 'Berhasil menambakan buku',
      };
    } catch (err) {
      throw new HttpException('Ada Kesalahan', HttpStatus.BAD_REQUEST);
    }
  }

  // createBook(title: string, author: string, year: number): ResponseSuccess {
  //   this.books.push({
  //     id: this.getPushIndex() + 1,
  //     title: title,
  //     author: author,
  //     year: year,
  //   });

  //   return {
  //     status: 'Success',
  //     message: 'Berhasil menambakan buku',
  //   };
  // }

  // createBook(
  //   title: string,
  //   author: string,
  //   year: number,
  // ): {
  //   status: string;
  //   messege: string;
  // } {
  //   this.books.push({
  //     id: this.getPushIndex() + 1,
  //     title: title,
  //     author: author,
  //     year: year,
  //   });

  //   return {
  //     status: 'Success',
  //     messege: 'Berhasil Menambahkan Data',
  //   };
  // }

  async updateBook(
    id: number,
    updateBookDto: UpdateBookDto,
  ): Promise<ResponseSuccess> {
    const check = await this.bookRepository.findOne({
      where: {
        id,
      },
    });

    if (!check)
      throw new NotFoundException(`Buku dengan id ${id} tidak ditemukan`);

    const update = await this.bookRepository.save({ ...updateBookDto, id: id });
    return {
      status: `Success `,
      message: 'Buku berhasil di update',
      data: update,
    };
  }

  // updateBook(
  //   id: number,
  //   title: string,
  //   author: string,
  //   year: number,
  // ): ResponseSuccess {
  //   const bookIndex = this.books.findIndex((book) => book.id === id);
  //   this.books[bookIndex].title = title;
  //   this.books[bookIndex].author = author;
  //   this.books[bookIndex].year = year;

  //   return {
  //     status: 'Success',
  //     message: 'Berhasil update buku',
  //   };
  // }

  // updateBook(
  //   id: number,
  //   payload: any,
  //   // id: number,
  //   // title: string,
  //   // author: string,
  //   // year: number,
  // ): {
  //   status: string;
  //   message: string;
  // } {
  //   const { title, author, year } = payload;
  //   const bookIndex = this.findBookById(id);
  //   this[bookIndex].title = title;
  //   this[bookIndex].author = author;
  //   this[bookIndex].year = year;

  //   return {
  //     status: 'Success',
  //     message: 'Data berhasil di update',
  //   };
  // }

  async bulkDelete(payload: deleteBookArrayDto): Promise<ResponseSuccess> {
    try {
      let berhasil = 0;
      let gagal = 0;
      await Promise.all(
        payload.delete.map(async (data) => {
          try {
            const result = await this.bookRepository.delete(data);

            if (result.affected === 1) {
              berhasil += 1;
            } else {
              gagal += 1;
            }
          } catch {}
        }),
      );

      return this._success(`Berhasil menghapus ${berhasil} dan gagal ${gagal}`);
    } catch {
      throw new HttpException('Ada Kesalahan', HttpStatus.BAD_REQUEST);
    }
  }

  async deleteBook(id: number): Promise<ResponseSuccess> {
    const check = await this.bookRepository.findOne({
      where: {
        id,
      },
    });

    if (!check)
      throw new NotFoundException(`Buku dengan id ${id} tidak ditemukan`);
    await this.bookRepository.delete(id);
    return {
      status: `Success `,
      message: 'Berhasil menghapus buku',
    };
  }
  // deleteBook(id: number): ResponseSuccess {
  //   const bookIndex = this.findBookById(id);
  //   this.books.splice(bookIndex, 1);
  //   return {
  //     status: `Success ${bookIndex}`,
  //     message: 'Berhasil menghapus buku',
  //   };
  // }

  // deleteBook(id: number): {
  //   status: string;
  //   message: string;
  // } {
  //   const bookIndex = this.findBookById(id);
  //   this.books.splice(bookIndex, 1);
  //   return {
  //     status: `Success ${bookIndex}`,
  //     message: `Data ${bookIndex} berhasil Di hapus`,
  //   };
  // }

  // getPushIndex() {
  //   const lastIndx = this.books.length;

  //   return lastIndx;
  // }
}
