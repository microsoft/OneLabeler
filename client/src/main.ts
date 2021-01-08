import Vue from 'vue';
import vuetify from './vuetify';
import App from './App.vue';
import store from './store';
import './style/scrollbar.css';
import './style/style.scss';

Vue.config.productionTip = false;

new Vue({
  vuetify,
  store,
  render: (h) => h(App),
}).$mount('#app');
