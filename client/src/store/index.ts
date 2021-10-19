import Vue from 'vue';
import Vuex from 'vuex';
import socket from '@/services/jupyter-api-plugin';
import state from './modules/state';
import mutations from './modules/mutations';
import * as actions from './modules/actions';
import * as getters from './modules/getters';
import workflow from './modules/workflow';
import plugins from './modules/plugins';

Vue.use(Vuex);

const store = new Vuex.Store({
  // set strict to false at distribution
  strict: true,
  state,
  mutations,
  actions,
  getters,
  modules: {
    workflow,
  },
  plugins,
});

socket.connect();
socket.close();
socket.bindStore(store);

export default store;
