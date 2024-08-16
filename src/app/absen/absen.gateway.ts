import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AbsenService } from './absen.service';
import { CreateAbsenSiswaDto } from './absen.dto';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import BaseResponse from 'src/utils/response/base.response';
import { InjectRepository } from '@nestjs/typeorm';
import { AbsenSiswa } from './absen-siswa/absen-siswa.entity';
import { Repository } from 'typeorm';
import { AbsenGuru } from './absen-guru/absen-guru.entity';
import { AbsenKelas } from './absen-kelas/absen-kelas.entity';
import { User } from '../auth/auth.entity';
import { REQUEST } from '@nestjs/core';
import { JamDetailJadwal } from '../jam-jadwal/jam-detail-jadwal.entity';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class AbsenGateway extends BaseResponse {
  @WebSocketServer() server: Server;

  constructor() {
    super();
  }

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
  
  @SubscribeMessage('createAbsenSiswa')
  async handleCreateAbsenSiswa(
    @ConnectedSocket() client: any,
    @MessageBody() payload: any,
  ) {
    this.server.emit('absenSiswaUpdated', payload);
    console.log('data pay', payload);

    return this._success('Siswa absen successfully', payload);
  }

  @SubscribeMessage('closeAbsen')
  async handleCloseAbsen(
    @ConnectedSocket() client: any,
    @MessageBody() payload: any,
  ) {
    this.server.emit('absenCloseUpdated', payload);
    console.log('data pay', payload);

    return this._success('Siswa absen successfully', payload);
  }
}
