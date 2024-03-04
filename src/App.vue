<template>
  <div>
    <h1>多对多</h1>
    <h2>当前SocketId：{{ ws?.socketId }}</h2>
    <video
      ref="localVideoRef"
      muted
      autoplay
      controls
      style="height: 300px"
    ></video>
    <button @click="handleSendJoin()">房主发起直播</button>
    <button @click="handleSendJoin()">用户加入直播</button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';

import { WebRTCPcClass } from '@/network/webrtc-pc';
import { WebSocketClass } from '@/network/websocket';

import {
  WsAnswerType,
  WsCandidateType,
  WsJoinType,
  WsLeaveType,
  WsMsgTypeEnum,
  WsOfferType,
  WsOtherJoinType,
} from './interface-ws';

const ws = ref<WebSocketClass>();
// const rtc = ref<WebRTCPcClass>();
const rtcMap = ref<Map<string, WebRTCPcClass>>(new Map());
const localVideoRef = ref<HTMLVideoElement>();
const localStream = ref<MediaStream>();

const mySocketId = ref('');
const roomId = ref('123');
const socketList = ref<string[]>([]);

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

async function handleSendJoin() {
  await handleGetDisplayMedia();
  ws.value?.send<WsJoinType['data']>({
    msgType: WsMsgTypeEnum.join,
    data: {
      room_id: roomId.value,
    },
  });
}

function createVideo() {
  const el = document.createElement('video');
  el.height = 300;
  el.controls = true;
  el.muted = true;
  el.autoplay = true;
  return el;
}

async function handleSendOffer(receiver) {
  console.log('handleSendOfferhandleSendOffer');
  if (rtcMap.value.get(receiver)) {
    return;
  }
  const rtc = new WebRTCPcClass({
    videoEl: createVideo(),
    ws: ws.value!,
    roomId: roomId.value,
    sender: mySocketId.value,
    receiver,
  });
  rtcMap.value.set(receiver, rtc);
  if (!localStream.value) {
    console.error('没有localStream');
    return;
  }
  localStream.value?.getTracks().forEach((track) => {
    if (rtc && localStream.value) {
      console.log('插入track', track);
      rtc.peerConnection?.addTrack(track, localStream.value);
      // rtc.peerConnection?.getSenders().forEach((sender) => {
      //   if (sender.track !== track) {
      //     rtc?.peerConnection?.addTrack(track, localStream.value!);
      //   }
      // });
    }
  });
  const offer = await rtc.createOffer();
  if (!offer) {
    console.error('没有offer');
    return;
  }
  await rtc.setLocalDescription(offer);
  ws.value?.send<WsOfferType['data']>({
    msgType: WsMsgTypeEnum.offer,
    data: {
      sdp: offer,
      room_id: roomId.value,
      sender: mySocketId.value,
      receiver,
    },
  });
}

function init() {
  ws.value = new WebSocketClass();
  ws.value.socket.on('connect', () => {
    console.log('connect成功', ws.value?.socket.id);
    if (ws.value) {
      ws.value.socketId = ws.value.socket.id;
      mySocketId.value = ws.value.socket.id;
    }
    initReceive();
  });
}

watch(
  () => rtcMap.value.size,
  (newval) => {
    if (newval) {
      rtcMap.value.forEach((item) => {
        const el = item.videoEl;
        document.body.appendChild(el);
      });
    }
  }
);

onMounted(() => {
  init();
});

function initReceive() {
  ws.value?.socket.on(WsMsgTypeEnum.offer, async (data: WsOfferType) => {
    console.log('收到offer', data);
    if (data.data.receiver === mySocketId.value) {
      console.log('是发送给我的offer');
      if (rtcMap.value.get(data.data.sender)) {
        return;
      }
      const rtc = new WebRTCPcClass({
        videoEl: createVideo(),
        ws: ws.value!,
        roomId: roomId.value,
        // 因为这里是收到offer，而offer是房主发的，所有此时的data.data.sender是房主；data.data.receiver是接收者；
        // 但是这里的new pc的sender，得是自己，不能是data.data.sender，不要混淆
        sender: mySocketId.value,
        // data.data.receiver是接收者；我们现在new pc，发送者是自己，接收者肯定是房主，不能是data.data.receiver，因为data.data.receiver是自己
        receiver: data.data.sender,
      });
      rtcMap.value.set(data.data.sender, rtc);
      await rtc.setRemoteDescription(data.data.sdp);
      localStream.value?.getTracks().forEach((track) => {
        if (rtc && localStream.value) {
          console.log('插入track', track);
          rtc.peerConnection?.addTrack(track, localStream.value);
          // rtc.peerConnection?.getSenders().forEach((sender) => {
          //   if (sender.track !== track) {
          //     rtc?.peerConnection?.addTrack(track, localStream.value!);
          //   }
          // });
        }
      });
      const answer = await rtc.createAnswer();
      if (answer) {
        await rtc.setLocalDescription(answer);
        ws.value?.send<WsAnswerType['data']>({
          msgType: WsMsgTypeEnum.answer,
          data: {
            room_id: roomId.value,
            sdp: answer,
            sender: mySocketId.value,
            // data.data.receiver是接收者；我们现在new pc，发送者是自己，接收者肯定是房主，不能是data.data.receiver，因为data.data.receiver是自己
            receiver: data.data.sender,
          },
        });
      } else {
        console.error('没有answer');
      }
    } else {
      console.log('不是发送给我的offer');
    }
  });
  ws.value?.socket.on(WsMsgTypeEnum.answer, (data: WsAnswerType) => {
    console.log('收到answer', data);
    if (data.data.receiver === mySocketId.value) {
      console.log('是发送给我的answer');
      rtcMap.value.get(data.data.sender)?.setRemoteDescription(data.data.sdp);
    } else {
      console.log('不是发送给我的answer');
    }
  });
  ws.value?.socket.on(WsMsgTypeEnum.candidate, (data: WsCandidateType) => {
    console.log('收到candidate', data);
    if (data.data.receiver === mySocketId.value) {
      console.log('是发送给我的candidate');
      rtcMap.value.get(data.data.sender)?.addIceCandidate(data.data.candidate);
    } else {
      console.log('不是发送给我的candidate');
    }
  });

  ws.value?.socket.on(WsMsgTypeEnum.joined, (data) => {
    console.log('收到joined', data);
  });
  ws.value?.socket.on(
    WsMsgTypeEnum.otherJoined,
    (data: WsOtherJoinType['data']) => {
      console.log('收到otherJoined', data);
      socketList.value = data.socket_list;
      data.socket_list.forEach((item) => {
        if (item !== mySocketId.value) {
          handleSendOffer(item);
        }
      });
    }
  );
  ws.value?.socket.on(WsMsgTypeEnum.disconnect, (data) => {
    console.log('收到disconnect', data);
  });

  ws.value?.socket.on(WsMsgTypeEnum.leave, (data: WsLeaveType['data']) => {
    console.log('收到leave', data);
    rtcMap.value.forEach((item) => {
      if (item.receiver === data.socket_id) {
        item.peerConnection?.close();
        item.videoEl.remove();
        rtcMap.value.delete(item.receiver);
      }
    });
  });

  ws.value?.socket.on(WsMsgTypeEnum.message, (data) => {
    console.log('收到message', data);
  });
}
</script>

<style lang="scss" scoped></style>
