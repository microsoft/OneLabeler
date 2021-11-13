<template>
  <component
    :is="component"
    :data-object="dataObject"
    :label="label"
    :label2color="label2color"
  />
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
} from '@vue/composition-api';
import {
  ILabel,
  IPointCloud,
} from '@/commons/types';
import BaseDisplayMultiView from './BaseDisplayMultiView.vue';
import BaseDisplaySingleView from './BaseDisplaySingleView.vue';

export default defineComponent({
  name: 'BaseDisplay',
  props: {
    /** The data object to be rendered. */
    dataObject: {
      type: Object as PropType<IPointCloud>,
      required: true,
    },
    /** The data label. */
    label: {
      type: Object as PropType<ILabel>,
      default: null,
    },
    label2color: {
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
    },
    multiView: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  },
  computed: {
    component() {
      if (this.multiView) return BaseDisplayMultiView;
      return BaseDisplaySingleView;
    },
  },
});
</script>
