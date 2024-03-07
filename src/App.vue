<template>
  <video
    ref="localVideo"
    autoplay
    controls
    style="height: 400px; width: 400px"
  ></video>
  <br />
  <br />
  <br />
  <video
    ref="remoteVideo"
    autoplay
    controls
    style="height: 400px; width: 400px"
  ></video>
  <button @click="getStream">获取stream流</button>
  <button @click="playFlv">playFlv</button>
</template>

<script setup lang="ts">
import axios from 'axios';
import FlvJs from 'flv.js';
import { ref } from 'vue';

import { WebRTCClass } from './network/webrtc';

const localStream = ref<MediaStream>();
const localVideo = ref<HTMLVideoElement>();
const remoteVideo = ref<HTMLVideoElement>();

// 'http://localhost:5001/sparklive/test'

function playFlv() {
  const flvPlayer = FlvJs.createPlayer({
    type: 'flv',
    url: 'http://localhost:5001/sparklive/test.flv',
  });
  console.log('flv拉流');
  flvPlayer.attachMediaElement(remoteVideo.value!);
  flvPlayer.load();
}

async function getStream() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  });
  localStream.value = stream;
  localVideo.value!.srcObject = stream;
  const rtc = new WebRTCClass();
  stream.getTracks().forEach((track) => {
    rtc.peerConnection?.addTrack(track, stream);
  });
  const sdp = await rtc.createOffer();
  if (!sdp) {
    console.error('createOffer没有sdp');
    return;
  }
  await rtc.setLocalDescription(sdp);

  const publishRes = await axios.post('http://localhost:1985/rtc/v1/publish/', {
    api: '/rtc/v1/publish/',
    streamurl: 'webrtc://localhost:5001/sparklive/test',
    sdp: sdp.sdp,
  });

  console.log(publishRes.data);

  if (publishRes.data.code != 0) {
    console.error('没拿到answer');
    return;
  }

  await rtc.setRemoteDescription(publishRes.data.sdp);
  console.log('okkk');
}
</script>

<style lang="less" scoped></style>
