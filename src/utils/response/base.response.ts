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
}

export default BaseResponse;
