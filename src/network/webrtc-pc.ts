import { WsCandidateType, WsMsgTypeEnum } from '@/interface-ws';

import { WebSocketClass } from './websocket';

export class WebRTCPcClass {
  peerConnection?: RTCPeerConnection;
  videoEl: HTMLVideoElement;
  ws: WebSocketClass;
  roomId: string;
  sender: string;
  receiver: string;

  constructor({
    videoEl,
    ws,
    roomId,
    sender,
    receiver,
  }: {
    videoEl: HTMLVideoElement;
    ws: WebSocketClass;
    roomId: string;
    sender: string;
    receiver: string;
  }) {
    this.videoEl = videoEl;
    this.ws = ws;
    this.roomId = roomId;
    this.sender = sender;
    this.receiver = receiver;
    if (!window.RTCPeerConnection) {
      console.error('当前环境不支持RTCPeerConnection！');
      alert('当前环境不支持RTCPeerConnection！');
      return;
    }
    this.peerConnection = new RTCPeerConnection();

    this.peerConnection?.addEventListener('track', (event) => {
      console.warn(`pc收到track事件`, event, event.streams);
      // event.streams[0].getTracks().forEach((track) => {
      //   console.log('pc插入track', track);
      //   const sender = this.peerConnection
      //     ?.getSenders()
      //     .find((sender) => sender.track === track);
      //   if (!sender) {
      //     this.peerConnection?.addTrack(track, event.streams[0]);
      //   }
      // });
      this.videoEl.srcObject = event.streams[0];
    });

    this.peerConnection?.addEventListener('icecandidate', (event) => {
      console.warn(`pc收到icecandidate事件`, event, event.candidate);
      if (event.candidate) {
        console.warn('发送candidate');
        this.ws.send<WsCandidateType['data']>({
          msgType: WsMsgTypeEnum.candidate,
          data: {
            candidate: event.candidate,
            room_id: this.roomId,
            sender: this.sender,
            receiver: this.receiver,
          },
        });
      } else {
        console.warn('没有候选者了');
      }
    });
  }
  setMaxBitrate = () => {
    // bit，比特
    // byte，字节
    // kb，千字节
    // mb，兆字节
    // gb，千兆字节

    // 1 Byte = 8 Bits
    // 1 KB = 1024 Bytes
    // 1 MB = 1024 KB
    // 1 GB = 1024 MB

    // 假设我们带宽是30m，即30mbps，
    // bps 是 bits per second 的简称，也就是每秒传输多少bit的意思
    // 30mbps，也就是每秒传输30m，
    // 因为1mb等于1024kb，所有30mb等于1024*30等于30720kb
    // 因此30m带宽理论速率是：30720 / 8 = 3840kb/s，也就是3840 / 1024 = 3.75mb/s

    this.peerConnection?.getSenders().forEach((sender) => {
      const parameters = sender.getParameters();
      parameters.encodings.forEach((parameters) => {
        // 假设我们配置最大推流是300kb/s,我们需要设置maxBitrate为：
        const bit = 1;
        const byte = bit * 8;
        const kb = byte * 1024;
        parameters.maxBitrate = 100 * kb;
      });
      sender.setParameters(parameters);
    });
  };

  createAnswer = async () => {
    try {
      const answer = await this.peerConnection?.createAnswer();
      console.log('createAnswer成功');
      return answer;
    } catch (error) {
      console.error('createAnswer错误');
      console.log(error);
    }
  };

  createOffer = async () => {
    try {
      const offer = await this.peerConnection?.createOffer();
      console.log('createOffer成功');
      return offer;
    } catch (error) {
      console.error('createOffer错误');
      console.log(error);
    }
  };

  addIceCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      await this.peerConnection?.addIceCandidate(candidate);
      console.log('addIceCandidate成功');
    } catch (error) {
      console.error('addIceCandidate错误');
      console.log(error);
    }
  };

  setLocalDescription = async (sdp: RTCLocalSessionDescriptionInit) => {
    try {
      await this.peerConnection?.setLocalDescription(sdp);
      console.log('setLocalDescription成功');
    } catch (error) {
      console.error('setLocalDescription错误');
      console.log(error);
    }
  };

  setRemoteDescription = async (sdp: RTCSessionDescriptionInit) => {
    try {
      await this.peerConnection?.setRemoteDescription(sdp);
      console.log('setRemoteDescription成功');
    } catch (error) {
      console.error('setRemoteDescription错误');
      console.log(error);
    }
  };
}
