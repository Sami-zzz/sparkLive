import '@/assets/global.scss';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import { createApp } from 'vue';

import router from '@/router';

import App from './App.vue';

const app = createApp(App);
app.use(router);
app.use(Antd);

app.mount('#app');
