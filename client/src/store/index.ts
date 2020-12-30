import Vue from 'vue';
import Vuex from 'vuex';
import state from './modules/state';
import mutations from './modules/mutations';
import * as actions from './modules/actions';
import * as getters from './modules/getters';

Vue.use(Vuex);

export default new Vuex.Store({
  // set strict to false at distribution
  strict: true,
  state,
  mutations,
  actions,
  getters,
  modules: {
  },
});
