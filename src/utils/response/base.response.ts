import { HttpStatus } from '@nestjs/common';
import { ResponsePagination, ResponseSuccess } from 'src/interface/respone';

class BaseResponse {
  _success(message: string, data?: any): ResponseSuccess {
    return {
      status: 'succes',
      message: message,
      data: data || {},
    };
  }

  _pagination(
    message: string,
    data: any,
    totalData: number,
    page: number,
    pageSize: number,
  ): ResponsePagination {
    return {
      status: 'succes',
      message: message,
      data: data,
      pagination: {
        total: totalData,
        page: page,
        pageSize: pageSize,
      },
    };
  }

   _error(message: string, statusCode: HttpStatus): ResponseSuccess {
    return {
      status: 'error',
      message: message,
      data: null,
      // statusCode: statusCode,
    };
  }
}

export default BaseResponse;
