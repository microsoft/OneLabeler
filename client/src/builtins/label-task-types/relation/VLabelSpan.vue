<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div :style="styleCard">
    <v-btn
      class="card-header-button subtitle-2 mr-1 elevation-0 text-none"
      style="border-color: #bbb"
      x-small
      outlined
    >
      {{ labelSpan.category }}
      <v-icon
        class="pl-2"
        aria-hidden="true"
        small
        :style="{ color }"
      >
        $vuetify.icons.values.square
      </v-icon>
    </v-btn>
    <div class="mx-1">
      {{ labelSpan.text }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { ILabelTextSpan } from '@/commons/types';
import { card as styleCard } from '@/style';

export default defineComponent({
  name: 'VLabelSpan',
  props: {
    labelSpan: {
      type: Object as PropType<ILabelTextSpan>,
      required: true,
    },
    color: {
      type: String as PropType<string>,
      default: '#bbb',
    },
  },
  data() {
    return { styleCard };
  },
});
</script>
