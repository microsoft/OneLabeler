import Vue from 'vue';
import Vuetify, { VuetifyPreset } from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import '@fortawesome/fontawesome-free/css/all.css';
import IconDotCircle from '@/plugins/IconDotCircle.vue';
import IconDrawPolygon from '@/plugins/IconDrawPolygon.vue';
import IconDrawSquare from '@/plugins/IconDrawSquare.vue';

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
  flowChart: 'fas fa-random',
  table: 'fas fa-border-all',
  filter: 'fas fa-filter',
  matrix: 'fas fa-th',
  hand: 'far fa-hand-paper',
  paint: 'fas fa-brush',
  circle: 'fas fa-circle',
  square: 'fas fa-square',
  pen: 'fas fa-pen',
  eraser: 'fas fa-eraser',
  expand: 'fas fa-expand',
  pan: 'fas fa-arrows-alt',
  sync: 'fas fa-sync-alt',
  edit: 'fas fa-edit',
  drawCircle: {
    name: 'drawCircle',
    component: IconDotCircle,
  },
  drawPolygon: {
    name: 'drawPolygon',
    component: IconDrawPolygon,
  },
  drawSquare: {
    name: 'drawSquare',
    component: IconDrawSquare,
  },
};

const preset: Partial<VuetifyPreset> = {
  icons: {
    iconfont: 'fa',
    values: icons,
  },
};

export default new Vuetify(preset);
