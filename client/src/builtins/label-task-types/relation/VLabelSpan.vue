<template>
  <div v-if="labelSpan !== null">
    <div style="display: flex">
      <v-btn
        class="view-header-button subtitle-2 mr-1 elevation-0 text-none"
        :style="{ 'border-color': '#bbb' }"
        x-small
        outlined
      >
        {{ labelSpan.category }}
        <v-icon
          class="pl-2"
          aria-hidden="true"
          small
          :style="{ color: label2color(labelSpan.category) }"
        >
          $vuetify.icons.values.square
        </v-icon>
      </v-btn>
    </div>
    <div class="mx-1">
      {{ labelSpan.text }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { ILabelTextSpan } from '@/commons/types';

export default Vue.extend({
  name: 'VLabelSpan',
  props: {
    labelSpan: {
      type: Object as PropType<ILabelTextSpan | null>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
});
</script>
