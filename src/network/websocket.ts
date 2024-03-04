import { Socket, io } from 'socket.io-client';

export class WebSocketClass {
  socket: Socket;
  socketId?: string;

  constructor() {
    this.socket = io('ws://localhost:4300', {
      transports: ['websocket'],
      forceBase64: false,
    });
  }

  // 发送websocket消息
  send = <T>({ msgType, data }: { msgType: string; data?: T }) => {
    if (!this.socket?.connected) {
      console.error(
        '【websocket】未连接成功，不发送websocket消息！',
        msgType,
        data
      );
      return;
    }
    console.warn('【websocket】发送消息', msgType, data);
    const sendData = {
      socket_id: this.socket.id,
      data,
    };
    this.socket?.emit(msgType, sendData);
  };

  update = () => {
    // this.socket=
  };

  // 手动关闭websocket连接
  close = () => {
    console.warn('手动关闭websocket连接', this.socket?.id);
    this.socket?.close();
  };
}
