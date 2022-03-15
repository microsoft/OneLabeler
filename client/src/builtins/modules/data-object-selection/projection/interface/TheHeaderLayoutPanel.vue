<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div
    :style="styleCardElevated"
    class="pa-3"
  >
    <div class="subtitle-1 grey--text text--darken-1">
      {{ `${nRows} x ${nColumns} layout` }}
    </div>
    <div
      style="display: grid"
      :style="{
        'grid-template-rows': `repeat(${maxRows}, ${100/maxRows}%)`,
        'grid-template-columns': `repeat(${maxColumns}, ${100/maxColumns}%)`,
      }"
    >
      <template v-for="row in maxRows">
        <template v-for="column in maxColumns">
          <div
            :key="`row-${row}-col-${column}`"
            :style="{
              'border-width': '1px',
              'border-style': 'solid',
              'border-color': (
                (column <= nColumns) && (row <= nRows)
              ) ? 'orange' : '#757575',
              'width': '40px',
              'height': '40px',
              'margin': '0.5px',
            }"
            @click="$emit('set:matrix-shape', { nRows: row, nColumns: column })"
          />
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { cardElevated as styleCardElevated } from '@/style';

export default defineComponent({
  name: 'TheHeaderLayoutPanel',
  props: {
    nRows: {
      type: Number as PropType<number>,
      required: true,
    },
    nColumns: {
      type: Number as PropType<number>,
      required: true,
    },
  },
  emits: {
    'set:matrix-shape': null,
  },
  data() {
    return {
      styleCardElevated,
      maxRows: 3,
      maxColumns: 3,
    };
  },
});
</script>
