<template>
  <div style="display: flex; align-items: center; border: thin solid rgba(0,0,0,.12);">
    <div
      class="px-1"
      style="display: flex; align-items: center;
        font-size: 0.875rem; height: 20px;
        border: thin solid rgba(0,0,0,.12); border-radius: 2px;"
    >
      <v-icon
        class="pr-1"
        aria-hidden="true"
        small
        :style="{ color: label2color(category) }"
      >
        $vuetify.icons.values.square
      </v-icon>
      {{ category }}
    </div>
    <v-spacer />

    <!-- The menu of setting the applicable label task of the category. -->
    <TheLabelTaskMenu
      :label-tasks="labelTasks"
      :selected-label-tasks="categoryTasks[category]"
      :disabled="category === unlabeledMark"
      @set:selected-label-tasks="onSetSelectedLabelTasks(category, $event)"
    />

    <v-menu
      :close-on-content-click="false"
      offset-y
    >
      <template #activator="{ on }">
        <v-btn
          title="set color"
          class="view-header-button elevation-0 ml-1"
          style="border-color: #bbb"
          x-small
          icon
          outlined
          v-on="on"
        >
          <v-icon
            aria-hidden="true"
            small
            :style="{ color: label2color(category) }"
          >
            $vuetify.icons.values.square
          </v-icon>
        </v-btn>
      </template>
      <v-color-picker
        dot-size="6"
        :value="label2color(category)"
        @input="$emit('upsert:color-mapper', { [category]: $event })"
      />
    </v-menu>

    <!-- The button for removing the label category. -->
    <v-btn
      :disabled="category === unlabeledMark"
      title="remove"
      class="view-header-button elevation-0 ml-1"
      style="border-color: #bbb"
      x-small
      icon
      outlined
      @click="$emit('remove:category', category)"
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
import type { Category, LabelTaskType } from '@/commons/types';
import TheLabelTaskMenu from './TheLabelTaskMenu.vue';

export default defineComponent({
  name: 'TheCategoryEntry',
  components: { TheLabelTaskMenu },
  props: {
    category: {
      type: String as PropType<Category>,
      required: true,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
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
  },
  emits: {
    'upsert:color-mapper': null,
    'set:category-tasks': null,
    'remove:category': null,
  },
  methods: {
    onSetSelectedLabelTasks(
      category: Category,
      labelTasks: LabelTaskType[] | null,
    ): void {
      const updatedCategoryTasks = {
        ...this.categoryTasks,
        [category]: labelTasks,
      };
      this.$emit('set:category-tasks', updatedCategoryTasks);
    },
  },
});
</script>
