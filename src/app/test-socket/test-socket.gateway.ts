import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class TestSocketGateway {
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    // client
    return 'Hello world!';
  }
}
