import { Module } from '@nestjs/common';
import { TestSocketController } from './test-socket.controller';
import { TestSocketService } from './test-socket.service';
import { TestSocketGateway } from './test-socket.gateway';

@Module({
  controllers: [TestSocketController],
  providers: [TestSocketService, TestSocketGateway]
})
export class TestSocketModule {}
