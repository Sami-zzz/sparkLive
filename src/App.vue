<template>
  <div class="app">
    <a-config-provider
      :theme="{
        token: {
          colorPrimary: '#f80a43',
        },
      }"
    >
      <router-view></router-view>
    </a-config-provider>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
