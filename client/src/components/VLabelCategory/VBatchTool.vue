<template>
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn
        x-small
        class="view-header-button subtitle-2 ml-2"
        v-on="on"
      >
        Set Batch Labels
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="(category, i) in [...classes, unlabeledMark]"
        :key="i"
        class="subtitle-2"
        style="min-height: 30px"
        @click="onSetCategory(category)"
      >
        {{ category }}
        <div style="flex-grow: 1" />
        <v-icon
          aria-hidden="true"
          small
          :style="`color: ${label2color(category)}`"
        >
          $vuetify.icons.values.square
        </v-icon>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Category } from '@/commons/types';

export default Vue.extend({
  name: 'VBatchTool',
  props: {
    classes: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    unlabeledMark: {
      type: String as PropType<Category>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    onSetCategory(category: Category): void {
      this.$emit('set:category', category);
    },
  },
});
</script>
