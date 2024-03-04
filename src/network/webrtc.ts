export class WebRTCClass {
  peerConnection?: RTCPeerConnection;
  videoEl?: HTMLVideoElement;

  constructor({ videoEl }: { videoEl: HTMLVideoElement }) {
    this.videoEl = videoEl;
    if (!window.RTCPeerConnection) {
      console.error('当前环境不支持RTCPeerConnection！');
      alert('当前环境不支持RTCPeerConnection！');
      return;
    }
    this.peerConnection = new RTCPeerConnection();
    this.peerConnection?.addEventListener('addstream', (event: any) => {
      console.warn(`pc收到addstream事件`, event, event.stream);
    });
    this.peerConnection?.addEventListener('addtrack', (event: any) => {
      console.warn(`pc收到addtrack事件`, event, event.stream);
    });
  }

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

  setLocalDescription = async (desc: RTCLocalSessionDescriptionInit) => {
    try {
      await this.peerConnection?.setLocalDescription(desc);
      console.log('setLocalDescription成功');
    } catch (error) {
      console.error('setLocalDescription错误');
      console.log(error);
    }
  };

  setRemoteDescription = async (sdp: string) => {
    try {
      await this.peerConnection?.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp })
      );
      console.log('setRemoteDescription成功');
    } catch (error) {
      console.error('setRemoteDescription错误');
      console.log(error);
    }
  };
}
