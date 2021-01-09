import Vue from 'vue';
import Vuetify, { VuetifyPreset } from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import '@fortawesome/fontawesome-free/css/all.css';

Vue.use(Vuetify);

const icons = {
  image: 'fas fa-image',
  new: 'fas fa-folder-plus',
  open: 'fas fa-folder-open',
  save: 'fas fa-save',
  reset: 'fas fa-trash',
  confirm: 'fas fa-check-circle',
  add: 'fas fa-plus-circle',
  close: 'fas fa-times',
  start: 'fas fa-play-circle',
  config: 'fas fa-cogs',
  parameter: 'fas fa-sliders-h',
  export: 'fas fa-file-export',
  undo: 'fas fa-undo',
  data: 'fas fa-database',
};

const preset: Partial<VuetifyPreset> = {
  icons: {
    iconfont: 'fa',
    values: icons,
  },
};

export default new Vuetify(preset);
