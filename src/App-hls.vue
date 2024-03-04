<template>
  <div class="app-wrap">
    <h1>rtc推流，hls拉流</h1>
    <video
      id="myVideo"
      ref="videoRef"
      muted
      autoplay
    ></video>
    <div
      id="pullVideo"
      ref="pullVideoRef"
    ></div>
    <!-- <button @click="getScreen">获取窗口</button> -->
    <button @click="startRTC">WebRTCClass</button>
    <button @click="playHls">playHls</button>
  </div>
</template>

<script lang="ts" setup>
import videoJs from 'video.js';
import { ref } from 'vue';

import { fetchRtcV1Publish } from './api/srs';
import { WebRTCClass } from './network/webrtc';

const rtc = ref<WebRTCClass>();
const videoRef = ref<HTMLVideoElement>();
const pullVideoRef = ref<HTMLVideoElement>();
const liveStreamName = ref('billd/ppp');

function playHls() {
  const videoEl = document.createElement('video');
  videoEl.autoplay = true;
  videoEl.muted = true;
  videoEl.playsInline = true;
  videoEl.setAttribute('webkit-playsinline', 'true');
  pullVideoRef.value?.appendChild(videoEl);
  const videoPlayer = videoJs(videoEl, {
    sources: [
      {
        src: `http://localhost:5001/${liveStreamName.value}.m3u8`,
        type: 'application/x-mpegURL',
      },
    ],
  });
  videoPlayer
    .play()
    ?.then(() => {
      console.log('播放hls成功');
    })
    .catch((e) => {
      console.log('播放hls失败', e);
    });
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
@import 'video.js/dist/video-js.min.css';

.app-wrap {
  #myVideo {
    width: 700px;
  }
  #pullVideo {
    width: 500px;
    height: 600px;

    :deep(video) {
      width: 500px;
    }
  }
}
</style>
