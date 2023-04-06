import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import ElementUI from 'element-plus'
import "element-plus/dist/index.css"

const app = createApp(App);
app.use(createPinia()).use(ElementUI).mount('#app');
