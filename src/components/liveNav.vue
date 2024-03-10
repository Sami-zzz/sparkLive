<template>
  <div class="live-nav">
    <div class="live-nav-left">
      <div class="logo">
        <img
          src="@/assets/img/logo.png"
          alt=""
        />
      </div>
      <div class="nav">
        <ul>
          <li>首页</li>
        </ul>
      </div>
    </div>
    <div class="live-nav-right">
      <div class="startlive">
        <a-button
          type="primary"
          @click="startMyLive"
          >我 要 开 播</a-button
        >
      </div>

      <ul class="user">
        <li>登录</li>
        <li>注册</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';

const startMyLive = () => {
  console.log('我要开播');
  router.push('/push');
};
</script>

<style scoped lang="scss">
.live-nav {
  height: 84px;

  display: flex;
  justify-content: space-between;
  padding: 0 30px;
  font-size: 20px;
  line-height: 84px;
  .live-nav-left {
    display: flex;
    .logo img {
      width: 230px;
      cursor: pointer;
    }
    .nav {
      li {
        cursor: pointer;
      }
    }
  }
  .live-nav-right {
    display: flex;
    .startlive {
      margin-right: 50px;
      button {
        width: 130px;
        height: 50px;
        font-size: 20px;
      }
    }
    .user {
      display: flex;
      margin-right: 50px;
      width: 140px;
      justify-content: space-evenly;

      li {
        cursor: pointer;
      }
    }
  }
}
</style>
