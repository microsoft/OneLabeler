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
        :categories="filterClassesByLabelTask(setup.type)"
        :label2color="label2color"
        :disabled="label === null"
        @upsert:label="$emit('upsert:label', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Category,
  ILabel,
  LabelTaskType,
  ILabelTaskTypeSetup,
  StatusType,
} from '@/commons/types';
import labelTaskTypeSetups from '@/builtins/label-task-types/index';

export default Vue.extend({
  name: 'VDataObjectCardHeader',
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
    filterClassesByLabelTask(labelTask: LabelTaskType): Category[] {
      const { categoryTasks } = this;
      const classesFiltered: Category[] = Object.entries(categoryTasks)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([category, usedInTasks]) => (
          usedInTasks === null || usedInTasks.includes(labelTask)
        )).map((d) => d[0]);
      return classesFiltered;
    },
  },
});
</script>
