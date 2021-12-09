<template>
  <div
    class="subtitle-1 grey darken-1"
    style="display: flex; align-items: center; user-select: none;"
  >
    {{ title }}
    <v-icon
      v-if="isLabeled"
      class="px-2"
      color="white"
      aria-hidden="true"
      style="font-size:12px; width: 1.5rem;"
      small
    >
      $vuetify.icons.values.verified
    </v-icon>

    <div style="flex-grow: 1" />

    <div
      v-for="(setup, i) in taskSetups"
      :key="i"
      style="display: flex"
    >
      <v-divider
        v-if="i !== 0"
        class="mx-1"
        vertical
      />
      <component
        :is="setup.singleTool"
        :label="label"
        :categories="filterCategoriesByLabelTask(setup.type)"
        :label2color="label2color"
        :disabled="label === null"
        @upsert:labels="$emit('upsert:labels', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { LabelTaskType, StatusType } from '@/commons/types';
import type {
  Category,
  ILabel,
  ILabelTaskTypeSetup,
} from '@/commons/types';
import labelTaskTypeSetups from '@/builtins/label-task-types/index';

export default defineComponent({
  name: 'VGridHeader',
  props: {
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    label: {
      type: Object as PropType<ILabel | undefined>,
      default: undefined,
      required: false,
    },
    status: {
      type: String as PropType<StatusType>,
      required: true,
    },
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
      required: true,
    },
    label2color: {
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
    },
    title: {
      type: String,
      default: '',
    },
  },
  emits: {
    'upsert:labels': null,
  },
  data() {
    return { LabelTaskType };
  },
  computed: {
    taskSetups(): ILabelTaskTypeSetup[] {
      const { labelTasks } = this;
      return labelTaskTypeSetups
        .filter((d) => (labelTasks as string[]).includes(d.type))
        .filter((d) => d.singleTool !== undefined);
    },
    isLabeled(): boolean {
      return this.status === StatusType.Labeled;
    },
  },
  methods: {
    filterCategoriesByLabelTask(labelTask: LabelTaskType): Category[] {
      return Object.entries(this.categoryTasks)
        .filter(([, usedInTasks]) => (
          usedInTasks === null || usedInTasks.includes(labelTask)
        )).map((d) => d[0]);
    },
  },
});
</script>
