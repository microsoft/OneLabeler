<template>
  <div style="display: flex">
    <v-btn
      v-for="category in classes"
      :key="category"
      class="view-header-button subtitle-2 mr-1 elevation-0 text-none"
      :class="{ 'white--text': category === brushCategory }"
      :style="{
        'border-color': '#bbb',
        'background-color': category === brushCategory
          ? label2color(category)
          : undefined,
      }"
      x-small
      outlined
      @click="onSetBrushCategory(category)"
    >
      {{ category }}
      <v-icon
        class="pl-2"
        aria-hidden="true"
        small
        :style="`color: ${label2color(category)}`"
      >
        $vuetify.icons.values.square
      </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Category,
  ILabelCategory,
} from '@/commons/types';

export default Vue.extend({
  name: 'VSingleTool',
  props: {
    classes: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    brushCategory: {
      type: String as PropType<ILabelCategory | null>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  methods: {
    onSetBrushCategory(category: ILabelCategory): void {
      const brush = category === this.brushCategory ? null : category;
      this.$emit('set:brush-category', brush);
    },
  },
});
</script>
