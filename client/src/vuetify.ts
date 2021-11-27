import Vue from 'vue';
import Vuetify, { VuetifyPreset } from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import '@fortawesome/fontawesome-free/css/all.css';
import IconDotCircle from '@/plugins/icons/IconDotCircle.vue';
import IconDrawPolygon from '@/plugins/icons/IconDrawPolygon.vue';
import IconDrawSquare from '@/plugins/icons/IconDrawSquare.vue';

Vue.use(Vuetify);

const icons = {
  hammer: 'fas fa-hammer',
  file: 'far fa-file',
  fileAudio: 'far fa-file-audio',
  fileImage: 'far fa-file-image',
  fileText: 'far fa-file-alt',
  fileVideo: 'far fa-file-video',
  fileZip: 'fas fa-file-archive',
  fileCode: 'fas fa-file-code',
  text: 'fas fa-paragraph',
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
  scissors: 'fas fa-cut',
  circle: 'fas fa-circle',
  square: 'fas fa-square',
  pen: 'fas fa-pen',
  eraser: 'fas fa-eraser',
  expand: 'fas fa-expand',
  pan: 'fas fa-arrows-alt',
  sync: 'fas fa-sync-alt',
  edit: 'fas fa-edit',
  server: 'fas fa-server',
  info: 'fas fa-info-circle',
  success: 'fas fa-check-circle',
  warning: 'fas fa-exclamation-circle',
  error: 'fas fa-times-circle',
  diagram: 'fas fa-project-diagram',
  skip: 'fas fa-forward',
  dashboard: 'fas fa-tachometer-alt',
  verified: 'fas fa-user-check',
  superpixel: 'fas fa-puzzle-piece',
  minimize: 'fas fa-minus',
  pin: 'fas fa-thumbtack',
  play: 'fas fa-play',
  pause: 'fas fa-pause',
  stop: 'fas fa-stop',
  volume: 'fas fa-volume-up',
  mute: 'fas fa-volume-mute',
  link: 'fas fa-link',
  arrowRight: 'fas fa-arrow-right',
  samples: 'fas fa-vials',
  labels: 'fas fa-tags',
  network: 'fas fa-network-wired',
  python: 'fab fa-python',
  fullScreen: 'far fa-square',
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
