import Vue from 'vue';
import VueCompositionAPI from '@vue/composition-api';
import VueKonva from 'vue-konva';
import vuetify from './vuetify';
import iconifyInit from './iconify';
import App from './App.vue';
import store from './store';
import './style/scrollbar.css';
import './style/style.scss';

iconifyInit();

Vue.use(VueCompositionAPI);
Vue.use(VueKonva);
Vue.config.productionTip = false;

new Vue({
  vuetify,
  store,
  render: (h) => h(App),
}).$mount('#app');
