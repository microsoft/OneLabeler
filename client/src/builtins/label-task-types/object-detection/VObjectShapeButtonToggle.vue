<template>
  <v-btn-toggle
    :value="objectShapeIndex"
    :mandatory="objectShapeIndex !== null"
    class="view-header-button-toggle"
  >
    <v-btn
      v-for="btn in objectShapeButtons"
      :key="btn.mouseOperation"
      :title="btn.title"
      :disabled="categoriesEmpty"
      class="px-1"
      icon
      x-small
      @click="$emit('set:mouse-operation', btn.mouseOperation)"
    >
      <v-icon
        v-if="btn.icon === $vuetify.icons.values.drawPolygon"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.drawPolygon
      </v-icon>
      <v-icon
        v-else-if="btn.icon === $vuetify.icons.values.drawSquare"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.drawSquare
      </v-icon>
      <v-icon
        v-else-if="btn.icon === $vuetify.icons.values.drawCircle"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.drawCircle
      </v-icon>
      <v-icon
        v-else
        aria-hidden="true"
        small
      >
        {{ btn.icon }}
      </v-icon>
    </v-btn>
  </v-btn-toggle>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { Category } from '@/commons/types';

export enum MouseOperationType {
  ClickCreatePolygon = 'ClickCreatePolygon',
  ClickCreateRect = 'ClickCreateRect',
  ClickCreatePoint = 'ClickCreatePoint',
  LassoCreatePolygon = 'LassoCreatePolygon',
  ScissorsCreatePolygon = 'ScissorsCreatePolygon',
}

export default {
  name: 'VObjectShapeButtonToggle',
  props: {
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    mouseOperation: {
      type: String as PropType<MouseOperationType>,
      required: true,
    },
  },
  data() {
    return {
      objectShapeButtons: [
        {
          title: 'bounding polygon',
          icon: this.$vuetify.icons.values.drawPolygon,
          mouseOperation: MouseOperationType.ClickCreatePolygon,
        },
        {
          title: 'bounding box',
          icon: this.$vuetify.icons.values.drawSquare,
          mouseOperation: MouseOperationType.ClickCreateRect,
        },
        {
          title: 'critical point',
          icon: this.$vuetify.icons.values.drawCircle,
          mouseOperation: MouseOperationType.ClickCreatePoint,
        },
        {
          title: 'free-form contour',
          icon: this.$vuetify.icons.values.pen,
          mouseOperation: MouseOperationType.LassoCreatePolygon,
        },
        {
          title: 'intellignet scissors',
          icon: this.$vuetify.icons.values.scissors,
          mouseOperation: MouseOperationType.ScissorsCreatePolygon,
        },
      ],
    };
  },
  computed: {
    categoriesEmpty(): boolean {
      return this.categories.length === 0;
    },
    objectShapeIndex(): number | null {
      const { mouseOperation, objectShapeButtons } = this;
      const index = objectShapeButtons
        .findIndex((d) => d.mouseOperation === mouseOperation);
      if (index === -1) return null;
      return index;
    },
  },
};
</script>
