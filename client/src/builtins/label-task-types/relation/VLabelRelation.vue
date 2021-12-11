<template>
  <div
    class="pa-1"
    :style="styleCard"
    style="display: flex; flex-direction: row; font-size: 10px;"
  >
    <!-- The source span on the left. -->
    <VLabelSpan
      :label-span="source"
      :color="label2color(source.category)"
      :style="{
        'border-color':
          isSelected !== null && isSelected(source) ? 'gray' : '#eee'
      }"
      class="label-span"
      @click="$emit('select:span', source)"
    />

    <v-icon
      class="px-1"
      aria-hidden="true"
      small
    >
      $vuetify.icons.values.arrowRight
    </v-icon>

    <!-- The target span on the right. -->
    <VLabelSpan
      :label-span="target"
      :color="label2color(target.category)"
      :style="{
        'border-color':
          isSelected !== null && isSelected(target) ? 'gray' : '#eee'
      }"
      class="label-span"
      @click="$emit('select:span', target)"
    />

    <!-- Delete relation button. -->
    <v-btn
      title="remove"
      class="card-header-button elevation-0 ml-1"
      style="border-color: #bbb"
      x-small
      icon
      outlined
      @click="$emit('remove:relation', relation)"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.reset
      </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { ILabelRelation, ILabelTextSpan } from '@/commons/types';
import { card as styleCard } from '@/style';
import VLabelSpan from './VLabelSpan.vue';

export default defineComponent({
  name: 'VLabelRelation',
  components: { VLabelSpan },
  props: {
    relation: {
      type: Object as PropType<ILabelRelation>,
      required: true,
    },
    source: {
      type: Object as PropType<ILabelTextSpan>,
      required: true,
    },
    target: {
      type: Object as PropType<ILabelTextSpan>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    isSelected: {
      type: Function as PropType<((span: ILabelTextSpan) => boolean) | null>,
      default: null,
    },
  },
  emits: {
    'select:span': null,
    'remove:relation': null,
  },
  data() {
    return { styleCard };
  },
});
</script>

<style scoped>
.label-span {
  border: 1px solid;
  flex: 1 1 50%;
  cursor: pointer;
  padding: 4px;
}
</style>
