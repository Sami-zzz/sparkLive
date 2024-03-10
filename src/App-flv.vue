<template>
  <video
    ref="videoRef"
    autoplay
    controls
    style="height: 400px; width: 400px"
  ></video>
  <br />
  <br />
  <br />
  <video
    ref="pullVideoRef"
    autoplay
    controls
    style="height: 400px; width: 400px"
  ></video>
  <button @click="startRTC">webrtcClass</button>
  <button @click="playFlv">playFlv</button>
</template>

<script setup lang="ts">
import FlvJs from 'flv.js';
import { ref } from 'vue';

import { fetchRtcV1Publish } from './api/srs';
import { WebRTCClass } from './network/webrtc';

const videoRef = ref<HTMLVideoElement>();
const pullVideoRef = ref<HTMLVideoElement>();
const liveStreamName = ref('sparklive/test');
const rtc = ref<WebRTCClass>();

// 'http://localhost:5001/sparklive/test'

// flv拉流
function playFlv() {
  const flvPlayer = FlvJs.createPlayer({
    type: 'flv',
    url: `http://localhost:5001/${liveStreamName.value}.flv`,
  });
  console.log('flv拉流');
  flvPlayer.attachMediaElement(pullVideoRef.value!);
  flvPlayer.load();
}

async function getScreen() {
  // 获取视频
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  });

  videoRef.value?.addEventListener('loadstart', () => {
    console.warn('视频流-loadstart');
  });

  videoRef.value?.addEventListener('loadedmetadata', async () => {
    console.warn('视频流-loadedmetadata');

    stream.getTracks().forEach((track) => {
      rtc.value?.peerConnection?.addTrack(track, stream);
    });
    const offer = await rtc.value?.createOffer();
    if (!offer) {
      console.error('createOffer失败');
      return;
    }
    await rtc.value?.setLocalDescription(offer);

    const res = await fetchRtcV1Publish({
      sdp: offer.sdp!,
      liveStreamName: liveStreamName.value,
    });
    console.log('fetchRtcV1Publish', res.data);
    if (res.data.code !== 200) {
      console.error('接口返回错误');
      return;
    }
    if (res.data.data.code !== 0) {
      console.error('srs没有返回spd');
      return;
    }
    await rtc.value?.setRemoteDescription(res.data.data.sdp);
  });

  videoRef.value!.srcObject = stream;
}

function startRTC() {
  const webrtc = new WebRTCClass({ videoEl: videoRef.value! });
  console.log(webrtc, 'new webrtc成功');
  rtc.value = webrtc;
  getScreen();
}
</script>

<style lang="less" scoped></style>
