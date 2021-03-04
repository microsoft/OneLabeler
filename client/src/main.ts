import Vue from 'vue';
import VueKonva from 'vue-konva';
import vuetify from './vuetify';
import App from './App.vue';
import store from './store';
import './style/scrollbar.css';
import './style/style.scss';

Vue.use(VueKonva);
Vue.config.productionTip = false;

new Vue({
  vuetify,
  store,
  render: (h) => h(App),
}).$mount('#app');
