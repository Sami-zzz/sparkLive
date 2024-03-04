<template>
  <div class="app-wrap">
    <h1>rtc推流，flv拉流</h1>
    <video
      id="myVideo"
      ref="videoRef"
      muted
      autoplay
    ></video>
    <video
      id="pullVideo"
      ref="pullVideoRef"
      muted
      autoplay
    ></video>
    <!-- <button @click="getScreen">获取窗口</button> -->
    <button @click="startRTC">WebRTCClass</button>
    <button @click="playFlv">playFlv</button>
  </div>
</template>

<script lang="ts" setup>
import flvJs from 'flv.js';
import { ref } from 'vue';

import { fetchRtcV1Publish } from './api/srs';
import { WebRTCClass } from './network/webrtc';

const rtc = ref<WebRTCClass>();
const videoRef = ref<HTMLVideoElement>();
const pullVideoRef = ref<HTMLVideoElement>();
const liveStreamName = ref('billd/ppp');

function playFlv() {
  const flvPlayer = flvJs.createPlayer({
    type: 'flv',
    url: `http://localhost:5001/${liveStreamName.value}.flv`,
  });
  console.log('123');
  flvPlayer.attachMediaElement(pullVideoRef.value!);
  flvPlayer.load();
}

async function getScreen() {
  const event = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  });
  // 视频轨、音频轨
  // const audio = event.getAudioTracks();
  // const video = event.getVideoTracks();
  console.log('getDisplayMedia成功', event);
  videoRef.value?.addEventListener('loadstart', () => {
    console.warn('视频流-loadstart');
  });
  videoRef.value?.addEventListener('loadedmetadata', async () => {
    console.warn('视频流-loadedmetadata');
    event.getTracks().forEach((track) => {
      rtc.value?.peerConnection?.addTrack(track, event);
    });
    const offer = await rtc.value?.createOffer();
    if (!offer) return;
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
  videoRef.value!.srcObject = event;
}

function startRTC() {
  const webrtc = new WebRTCClass({ videoEl: videoRef.value! });
  console.log(webrtc, 'new webrtc成功');
  rtc.value = webrtc;
  getScreen();
}
</script>

<style lang="scss" scoped>
.app-wrap {
  #myVideo {
    width: 700px;
  }
  #pullVideo {
    width: 500px;
  }
}
</style>
