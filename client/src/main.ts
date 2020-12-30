import Vue from 'vue';
import vuetify from './vuetify';
import App from './App.vue';
import store from './store';
import './style/style.css';
import './style/scrollbar.css';

Vue.config.productionTip = false;

new Vue({
  vuetify,
  store,
  render: (h) => h(App),
}).$mount('#app');
