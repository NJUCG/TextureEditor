import { createApp } from 'vue'
import App from './App.vue'
import  Store,{key} from './store'

createApp(App).use(Store, key).mount('#app')
