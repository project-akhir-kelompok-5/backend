import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { DeleteBulkUserDto, LoginDto, queryUSerDTO, RegisterDto, ResetPasswordDto } from './auth.dto';
import { JwtAccessTokenStrategy } from './jwtAccessToken.strategy';
import { JwtGuard, JwtGuardRefreshToken } from './auth.guard';
import { ResponseSuccess } from 'src/interface/respone';
import { query } from 'express';
import { Pagination } from 'src/utils/decorator/pagination.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @UseGuards(JwtGuard)
  @Get('user-list')
  async getUsers(@Pagination() query: queryUSerDTO) {
    return this.authService.getUsers(query);
  }

  @Post('delete-bulk')
  async deleteUsers(@Body() payload: DeleteBulkUserDto) {
    return this.authService.DeleteBulkUser(payload);
  }

  @Post('register-bulk')
  async registerBulk(@Body() payloads: RegisterDto[]): Promise<ResponseSuccess> {
    return this.authService.registerBulk(payloads);
  }

  @Post('login')
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  async profile(@Req() req) {
    console.log('Informasi User', req.user);
    console.log('id', req.user.id); // cara memanggil id nya saja
    const { id } = req.user;
    return this.authService.profile(id);
  }

  @UseGuards(JwtGuardRefreshToken)
  @Get('refresh-token')
  async refreshToken(@Req() req) {
    const token = req.headers.authorization.split(' ')[1];
    const id = req.headers.id;
    return this.authService.refreshToken(+id, token);
  }

  @Post('lupa-password')
  async forgotPassword(@Body('email') email: string) {
    console.log('email', email);
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password/:user_id/:token') // url yang dibuat pada endpoint harus sama dengan ketika kita membuat link pada service forgotPassword
  async resetPassword(
    @Param('user_id') user_id: string,
    @Param('token') token: string,
    @Body() payload: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(+user_id, token, payload);
  }
}
