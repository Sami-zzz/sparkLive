<template>
  <div class="home">
    <liveNav></liveNav>
    <div class="home-banner">
      <div class="home-main">
        <div class="home-main-left">
          <li></li>
        </div>
        <ul class="home-main-right">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import liveNav from '@/components/liveNav.vue';
</script>

<style scoped lang="scss">
.home-banner {
  height: 740px;
  background: url('@/assets/img/banner.jpg');
  padding-top: 40px;
  .home-main {
    height: 650px;
    width: 1400px;
    margin: 0 auto;

    display: flex;
    justify-content: space-between;
    .home-main-left {
      width: 1130px;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 10px;
      li {
        width: 100%;
        height: 100%;
        background-color: #ccc;
        border-radius: 10px;
      }
    }

    .home-main-right {
      width: 250px;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      border-radius: 8px;
      li {
        width: 220px;
        height: 114px;
        background-color: #ccc;
        border-radius: 4px;
      }
    }
  }
}
</style>
