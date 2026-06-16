import './style.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { setupMonitoring } from './config/monitor.config.ts'
import { router } from './router.ts'

const app = createApp(App)

app.use(createPinia())

app.use(router)

setupMonitoring(app, router)

app.mount('#app')
