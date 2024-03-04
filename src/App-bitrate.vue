<template>
  <div>
    <h1>websocket测试</h1>
    <h2>当前SocketId：{{ ws?.socketId }}</h2>
    <video
      ref="localVideoRef"
      muted
      autoplay
      controls
      style="height: 600px"
    ></video>
    <button @click="handleGetDisplayMedia">getDisplayMedia</button>
    <button @click="handleSendJoin">join</button>
    <button @click="handleSendOffer">offer</button>
    <button @click="handleFramerate">设置帧率</button>
    <button @click="handleResolutionRatio">设置分辨率</button>
    <button @click="handleSetMaxBitrate">设置码率</button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { WebRTCPcClass } from '@/network/webrtc-pc';
import { WebSocketClass } from '@/network/websocket';

import {
  WsAnswerType,
  WsCandidateType,
  WsJoinType,
  WsMsgTypeEnum,
  WsOfferType,
} from './interface-ws';

const ws = ref<WebSocketClass>();
const rtc = ref<WebRTCPcClass>();
const localVideoRef = ref<HTMLVideoElement>();
const localStream = ref<MediaStream>();

const roomId = ref('123');

function handleFramerate() {
  console.log('handleFramerate');
  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => {
      if (track.kind === 'video') {
        console.log(track);
        const old = track.getConstraints();
        track.applyConstraints({ ...old, frameRate: 1 });
        console.log('设置帧率完成');
      }
    });
  }
}

function handleResolutionRatio() {
  console.log('handleResolutionRatio');
  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => {
      if (track.kind === 'video') {
        console.log(track);
        const old = track.getConstraints();
        track.applyConstraints({ ...old, height: 200 });
        console.log('设置分辨率完成');
      }
    });
  }
}

function handleSetMaxBitrate() {
  console.log('handleResolutionRatio');
  rtc.value?.setMaxBitrate();
}

async function handleGetDisplayMedia() {
  try {
    localStream.value = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    if (localVideoRef.value) {
      localVideoRef.value.srcObject = localStream.value;
    }
  } catch (error) {
    console.error('getDisplayMedia错误');
  }
}

function handleSendJoin() {
  ws.value?.send<WsJoinType['data']>({
    msgType: WsMsgTypeEnum.join,
    data: {
      room_id: roomId.value,
    },
  });
}

async function handleSendOffer() {
  rtc.value = new WebRTCPcClass({
    videoEl: localVideoRef.value!,
    ws: ws.value!,
    roomId: roomId.value,
  });
  if (!localStream.value) {
    console.error('没有localStream');
    return;
  }
  localStream.value.getTracks().forEach((track) => {
    if (rtc.value && localStream.value) {
      console.log('插入track', track);
      rtc.value.peerConnection?.addTrack(track, localStream.value);
      // rtc.value.peerConnection?.getSenders().forEach((sender) => {
      //   if (sender.track !== track) {
      //     rtc.value?.peerConnection?.addTrack(track, localStream.value!);
      //   }
      // });
    }
  });
  const offer = await rtc.value.createOffer();
  if (!offer) {
    console.error('没有offer');
    return;
  }
  await rtc.value.setLocalDescription(offer);
  ws.value?.send<WsOfferType['data']>({
    msgType: WsMsgTypeEnum.offer,
    data: { sdp: offer, room_id: roomId.value },
  });
}

function init() {
  ws.value = new WebSocketClass();
  ws.value.socket.on('connect', () => {
    console.log('connect成功', ws.value?.socket.id);
    if (ws.value) {
      ws.value.socketId = ws.value.socket.id;
    }
    initReceive();
  });
}

onMounted(() => {
  init();
});

function initReceive() {
  ws.value?.socket.on(WsMsgTypeEnum.offer, async (data: WsOfferType) => {
    console.log('收到offer', data);
    rtc.value = new WebRTCPcClass({
      videoEl: localVideoRef.value!,
      ws: ws.value!,
      roomId: roomId.value,
    });
    await rtc.value.setRemoteDescription(data.data.sdp);
    const answer = await rtc.value.createAnswer();
    if (answer) {
      await rtc.value.setLocalDescription(answer);
      ws.value?.send<WsAnswerType['data']>({
        msgType: WsMsgTypeEnum.answer,
        data: { room_id: roomId.value, sdp: answer },
      });
    } else {
      console.error('没有answer');
    }
  });
  ws.value?.socket.on(WsMsgTypeEnum.answer, (data: WsAnswerType) => {
    console.log('收到answer', data);
    rtc.value?.setRemoteDescription(data.data.sdp);
  });
  ws.value?.socket.on(WsMsgTypeEnum.candidate, (data: WsCandidateType) => {
    console.log('收到candidate', data);
    rtc.value?.addIceCandidate(data.data.candidate);
  });

  ws.value?.socket.on(WsMsgTypeEnum.joined, (data) => {
    console.log('收到joined', data);
  });
  ws.value?.socket.on(WsMsgTypeEnum.message, (data) => {
    console.log('收到message', data);
  });
}
</script>

<style lang="scss" scoped></style>
