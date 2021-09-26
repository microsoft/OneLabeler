import Vue from 'vue';
import VueCompositionAPI from '@vue/composition-api';
import VueKonva from 'vue-konva';
import { addCollection } from '@iconify/vue2';
import vuetify from './vuetify';
import App from './App.vue';
import store from './store';
import './style/scrollbar.css';
import './style/style.scss';

addCollection({
  prefix: 'mdi',
  icons: {
    'dock-window': {
      body: '<path d="M18 18v2H4a2 2 0 0 1-2-2V8h2v10M22 6v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2m-2 0H8v8h12z" fill="currentColor"/>',
    },
    'dock-left': {
      body: '<path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 14H9V6h11z" fill="currentColor"/>',
    },
    'dock-bottom': {
      body: '<path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 9H4V6h16z" fill="currentColor"/>',
    },
    'dock-right': {
      body: '<path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m-5 14H4V6h11z" fill="currentColor"/>',
    },
  },
  width: 24,
  height: 24,
});

Vue.use(VueCompositionAPI);
Vue.use(VueKonva);
Vue.config.productionTip = false;

new Vue({
  vuetify,
  store,
  render: (h) => h(App),
}).$mount('#app');
