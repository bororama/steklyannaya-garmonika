import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

declare global {
    var id : string;
    var username : string;
}

const app = createApp(App)

app.mount('#app')
