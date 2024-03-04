<template>
  <div>
    <h1>canvas绘制视频</h1>
    <video
      ref="videoRef"
      autoplay
      muted
      width="400"
      height="400"
      controls
    ></video>
    <canvas
      ref="canvasRef"
      width="400"
      height="400"
    ></canvas>
    <div>
      <input
        ref="uploadRef"
        type="file"
      />
      <button @click="drawImage">drawImage</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const uploadRef = ref<HTMLInputElement>();
const videoRef = ref<HTMLVideoElement>();
const canvasRef = ref<HTMLCanvasElement>();

function drawImage() {
  // 1.拿到视频文件
  const videoFile = uploadRef.value?.files?.[0]!;
  // blob:xxx
  const url = URL.createObjectURL(videoFile);
  const newVideoEl = document.createElement('video');
  newVideoEl.width = 400;
  newVideoEl.src = url;
  newVideoEl.autoplay = true;
  newVideoEl.muted = true;
  newVideoEl.controls = true;
  // 2.将video挂载到body
  document.body.appendChild(newVideoEl);
  setTimeout(() => {
    if (!canvasRef.value) {
      return;
    }
    // 3.获取canvas上下文
    const ctx = canvasRef.value.getContext('2d')!;
    const { width, height } = newVideoEl.getBoundingClientRect();
    if (videoRef.value) {
      // 4.将canvas的视频流设置到video标签
      videoRef.value.srcObject = canvasRef.value.captureStream();
    }
    // 视频需要60帧的话，即一秒显示60张图片，因此轮询间隔就是 1000 / 60 = 16.6666
    // react的fiber架构，其实就是优化这个16毫秒，因为人眼看东西，低于60帧就会感觉到卡顿，所以，16毫秒就是一个分水岭。
    // 如果视频的帧率越高，很明显视频体积越大。实际上大部分电影都是24帧的。
    setInterval(() => {
      // 5.轮询绘制
      ctx.drawImage(newVideoEl, 0, 0, width, height);
    }, 1000 / 30);
  }, 100);
}
</script>

<style lang="scss" scoped></style>
