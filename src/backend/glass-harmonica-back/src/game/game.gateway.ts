import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({ namespace: 'game'})
export class GameGateway {
  @SubscribeMessage('test')
  handleMessage(client: any, payload: any): string {
    return 'Hello curro!';
  }
}
