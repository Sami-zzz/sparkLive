<template>
  <div>
    <h1>web audio混流</h1>
    <video
      ref="videoRef"
      autoplay
      muted
      width="400"
      height="400"
      controls
    ></video>
    <div>
      <input
        ref="uploadRef"
        type="file"
      />
      <button @click="handleNullAudio">handleNullAudio</button>
      <button @click="handleVideoAudio">handleVideoAudio</button>
      <button @click="handleMic">handleMic</button>
      <button @click="handleMixedAudio">handleMixedAudio</button>
      <button @click="handleMsr">handleMsr</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const uploadRef = ref<HTMLInputElement>();
const videoRef = ref<HTMLVideoElement>();
const streamList = ref<MediaStream[]>([]);

async function handleMic() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true,
  });
  const video = document.createElement('video');
  video.id = 'mic';
  video.autoplay = true;
  // video.muted = true;
  video.controls = true;
  video.srcObject = stream;
  streamList.value.push(stream);
  document.body.appendChild(video);
}

function handleMsr() {
  // @ts-ignore
  const stream = videoRef.value!.captureStream();
  const recorder = new MediaRecorder(stream, {
    // https://developer.mozilla.org/en-US/docs/Web/Media/Formats/codecs_parameter#videomp4_codecsavc1.4d002a
    mimeType: 'video/webm;codecs=avc1.4d002a,opus',
  });
  recorder.ondataavailable = (event) => {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(event.data);
    link.download = 'billd-live.webm';
    link.click();
    window.URL.revokeObjectURL(link.href);
    recorder.pause();
  };
  recorder.start(5000);
}

function handleNullAudio() {
  // 创建AudioContext对象
  const audioContext = new AudioContext();

  // 创建输入和输出节点
  const source = audioContext.createBufferSource();
  const destination = audioContext.createMediaStreamDestination();

  // 连接输入和输出节点
  source.connect(destination);

  // 播放空白音频
  source.start();

  // 获取音频流
  const stream = destination.stream;
  streamList.value.push(stream);

  const video = document.createElement('video');
  video.id = 'nullaudio';
  video.autoplay = true;
  // video.muted = true;
  video.controls = true;
  video.srcObject = stream;
  document.body.appendChild(video);
}

function handleVideoAudio() {
  const videoFile = uploadRef.value?.files?.[0]!;
  const url = URL.createObjectURL(videoFile);
  const video = document.createElement('video');
  video.id = 'video';
  video.width = 400;
  video.src = url;
  video.loop = true;
  video.autoplay = true;
  // video.muted = true;
  video.controls = true;
  document.body.appendChild(video);
  // @ts-ignore
  const stream = video.captureStream();
  streamList.value.push(stream);
}

function handleMixedAudio() {
  const audioCtx = new AudioContext();
  const res: { source: MediaStreamAudioSourceNode; gainNode: GainNode }[] = [];

  streamList.value.forEach((stream) => {
    const source = audioCtx.createMediaStreamSource(stream);
    const gainNode = audioCtx.createGain();
    source.connect(gainNode);
    res.push({ source, gainNode });
    console.log('混流', stream.id, stream);
  });
  const destination = audioCtx.createMediaStreamDestination();
  res.forEach((item) => {
    item.source.connect(item.gainNode);
    item.gainNode.connect(destination);
  });
  videoRef.value!.srcObject = destination.stream;
}
</script>

<style lang="scss" scoped></style>
