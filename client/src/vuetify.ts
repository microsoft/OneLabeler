// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Vue from 'vue';
import Vuetify, { VuetifyPreset } from 'vuetify';
import {
  VApp,
  VAutocomplete,
  VBtn,
  VBtnToggle,
  VCard,
  VCheckbox,
  VChip,
  VColorPicker,
  VDialog,
  VDivider,
  VForm,
  VIcon,
  VMenu,
  VList,
  VListItem,
  VListItemContent,
  VListItemTitle,
  VPagination,
  VSpacer,
  VSwitch,
  VSnackbar,
  VSimpleTable,
  VTextarea,
  VTextField,
} from 'vuetify/lib';
import 'vuetify/dist/vuetify.min.css';
import '@fortawesome/fontawesome-free/css/all.css';
import IconDotCircle from '@/plugins/icons/IconDotCircle.vue';
import IconDrawPolygon from '@/plugins/icons/IconDrawPolygon.vue';
import IconDrawSquare from '@/plugins/icons/IconDrawSquare.vue';
import IconFeatureRepresentations from '@/plugins/icons/IconFeatureRepresentations.vue';
import IconLabels from '@/plugins/icons/IconLabels.vue';
import IconLabelSpace from '@/plugins/icons/IconLabelSpace.vue';
import IconSamples from '@/plugins/icons/IconSamples.vue';
import IconStop from '@/plugins/icons/IconStop.vue';
import IconModel from '@/plugins/icons/IconModel.vue';

Vue.use(Vuetify, {
  components: {
    VApp,
    VAutocomplete,
    VBtn,
    VBtnToggle,
    VCard,
    VCheckbox,
    VChip,
    VColorPicker,
    VDialog,
    VDivider,
    VForm,
    VIcon,
    VMenu,
    VList,
    VListItem,
    VListItemContent,
    VListItemTitle,
    VPagination,
    VSpacer,
    VSwitch,
    VSnackbar,
    VSimpleTable,
    VTextarea,
    VTextField,
  },
});

const icons = {
  hammer: 'fa-fw fas fa-hammer',
  file: 'fa-fw far fa-file',
  fileAudio: 'fa-fw far fa-file-audio',
  fileImage: 'fa-fw far fa-file-image',
  fileText: 'fa-fw far fa-file-alt',
  fileVideo: 'fa-fw far fa-file-video',
  fileZip: 'fa-fw fas fa-file-archive',
  fileCode: 'fa-fw fas fa-file-code',
  text: 'fa-fw fas fa-paragraph',
  new: 'fa-fw fas fa-folder-plus',
  open: 'fa-fw fas fa-folder-open',
  save: 'fa-fw fas fa-save',
  reset: 'fa-fw fas fa-trash',
  confirm: 'fa-fw fas fa-check-circle',
  add: 'fa-fw fas fa-plus-circle',
  close: 'fa-fw fas fa-times',
  start: 'fa-fw fas fa-play-circle',
  config: 'fa-fw fas fa-cogs',
  parameter: 'fa-fw fas fa-sliders-h',
  export: 'fa-fw fas fa-file-export',
  undo: 'fa-fw fas fa-undo',
  data: 'fa-fw fas fa-database',
  flowChart: 'fa-fw fas fa-random',
  table: 'fa-fw fas fa-border-all',
  filter: 'fa-fw fas fa-filter',
  matrix: 'fa-fw fas fa-th',
  hand: 'fa-fw far fa-hand-paper',
  paint: 'fa-fw fas fa-brush',
  scissors: 'fa-fw fas fa-cut',
  circle: 'fa-fw fas fa-circle',
  square: 'fa-fw fas fa-square',
  pen: 'fa-fw fas fa-pen',
  eraser: 'fa-fw fas fa-eraser',
  expand: 'fa-fw fas fa-expand',
  pan: 'fa-fw fas fa-arrows-alt',
  sync: 'fa-fw fas fa-sync-alt',
  edit: 'fa-fw fas fa-edit',
  server: 'fa-fw fas fa-server',
  info: 'fa-fw fas fa-info-circle',
  success: 'fa-fw fas fa-check-circle',
  warning: 'fa-fw fas fa-exclamation-circle',
  error: 'fa-fw fas fa-times-circle',
  diagram: 'fa-fw fas fa-project-diagram',
  skip: 'fa-fw fas fa-forward',
  dashboard: 'fa-fw fas fa-tachometer-alt',
  verified: 'fa-fw fas fa-user-check',
  superpixel: 'fa-fw fas fa-puzzle-piece',
  minimize: 'fa-fw fas fa-minus',
  pin: 'fa-fw fas fa-thumbtack',
  play: 'fa-fw fas fa-play',
  pause: 'fa-fw fas fa-pause',
  stop: 'fa-fw fas fa-stop',
  volume: 'fa-fw fas fa-volume-up',
  mute: 'fa-fw fas fa-volume-mute',
  link: 'fa-fw fas fa-link',
  arrowRight: 'fa-fw fas fa-arrow-right',
  network: 'fa-fw fas fa-network-wired',
  python: 'fa-fw fab fa-python',
  fullScreen: 'fa-fw far fa-square',
  changeDirection: 'fa-fw fas fa-exchange-alt',
  minimap: 'fa-fw fa-solid fa-map-location-dot',
  github: 'fa-fw fab fa-github',
  documentation: 'fa-fw fa-solid fa-graduation-cap',
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
  features: {
    name: 'features',
    component: IconFeatureRepresentations,
  },
  labels: {
    name: 'labels',
    component: IconLabels,
  },
  samples: {
    name: 'samples',
    component: IconSamples,
  },
  categories: {
    name: 'categories',
    component: IconLabelSpace,
  },
  stoppage: {
    name: 'stoppage',
    component: IconStop,
  },
  model: {
    name: 'model',
    component: IconModel,
  },
};

const preset: Partial<VuetifyPreset> = {
  icons: {
    iconfont: 'fa',
    values: icons,
  },
};

export default new Vuetify(preset);
