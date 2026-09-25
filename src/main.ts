import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { VApp, VBtn, VIcon, VMain, VProgressLinear, VSelect } from 'vuetify/components'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import './styles.css'
import App from './App.vue'

const vuetify = createVuetify({
  components: { VApp, VBtn, VIcon, VMain, VProgressLinear, VSelect },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'operationsDark',
    themes: {
      operations: {
        dark: false,
        colors: {
          primary: '#14283e',
          secondary: '#527568',
          surface: '#ffffff',
          background: '#f3f5f7',
        },
      },
      operationsDark: {
        dark: true,
        colors: {
          primary: '#172b3e',
          secondary: '#65ba94',
          surface: '#1b2a39',
          background: '#111d28',
        },
      },
    },
  },
})

createApp(App).use(vuetify).mount('#app')
