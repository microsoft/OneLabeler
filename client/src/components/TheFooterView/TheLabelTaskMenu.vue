<template>
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn
        :disabled="disabled"
        class="view-header-button subtitle-2 text-none"
        x-small
        v-on="on"
      >
        {{
          selectedLabelTasks === null
            ? `used in all tasks`
            : `used in ${selectedLabelTasks.length} tasks`
        }}
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="(labelTask, i) in labelTasks"
        :key="i"
        class="subtitle-2 pr-4 pl-2"
        style="min-height: 30px"
        @click.stop="onClickLabelTask(labelTask)"
      >
        <v-checkbox
          :value="isLabelTaskSelected(labelTask)"
          :input-value="isLabelTaskSelected(labelTask)"
          class="py-0 ma-0"
          dense
          hide-details
        />
        {{ labelTask }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { LabelTaskType } from '@/commons/types';

export default defineComponent({
  name: 'TheLabelTaskMenu',
  props: {
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    /** The selected label tasks (null denotes all selected). */
    selectedLabelTasks: {
      type: Array as PropType<LabelTaskType[] | null>,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'set:selected-label-tasks': null,
  },
  methods: {
    onClickLabelTask(labelTask: LabelTaskType): void {
      const { labelTasks, selectedLabelTasks } = this;
      if (selectedLabelTasks === null) {
        const newValue = labelTasks.filter((d) => d !== labelTask);
        this.$emit('set:selected-label-tasks', newValue);
        return;
      }
      const idx = selectedLabelTasks.findIndex((d) => d === labelTask);
      const newValue: LabelTaskType[] = idx >= 0
        ? [...selectedLabelTasks.slice(0, idx), ...selectedLabelTasks.slice(idx + 1)]
        : [...selectedLabelTasks, labelTask];
      this.$emit('set:selected-label-tasks', newValue);
    },
    isLabelTaskSelected(labelTask: LabelTaskType): boolean {
      const { selectedLabelTasks } = this;
      if (selectedLabelTasks === null) return true;
      return selectedLabelTasks.includes(labelTask);
    },
  },
});
</script>
