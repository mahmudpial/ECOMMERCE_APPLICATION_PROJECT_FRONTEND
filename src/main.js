import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'bootstrap/dist/css/bootstrap.min.css'
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import '@/assets/main.css'

import App from './App.vue'
import router from './router'

// Global components
import LoadingSpinner from './components/global/LoadingSpinner.vue'
import ErrorMessage from './components/global/ErrorMessage.vue'

// Make Bootstrap available globally (required for modals)
window.bootstrap = bootstrap

const app = createApp(App)

app.component('LoadingSpinner', LoadingSpinner)
app.component('ErrorMessage', ErrorMessage)

app.use(createPinia())
app.use(router)

app.mount('#app')
