<template>
  <v-card tile>
    <div class="view-header">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.parameter
      </v-icon>
      {{ viewTitle }}
    </div>

    <v-divider />

    <!-- The label of the process node. -->
    <VNodeEditableLabel
      :label="node.label"
      class="py-2 px-4"
      @edit:label="$emit('edit:node', { ...node, label: $event })"
    />

    <v-divider />

    <!-- The data type selection. -->
    <div
      class="px-4"
      style="display: flex; flex: 1 1 100%; min-height: 40px; align-items: center;"
    >
      <span
        class="subtitle-2"
        style="user-select: none; flex: 1 1 100%; align-self: center;"
      >
        Data Type
      </span>
      <v-menu offset-y>
        <template #activator="{ on }">
          <v-btn
            class="subtitle-2 text-none"
            style="border-color: #e0e0e0"
            small
            outlined
            v-on="on"
          >
            {{ selectedDataType }}
          </v-btn>
        </template>
        <v-list
          class="subtitle-2"
          dense
        >
          <v-list-item
            v-for="(option, i) in menuOfDataType.options"
            :key="i"
            @click="onUpdateDataTypeOption(option.value)"
          >
            {{ option.label }}
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <!-- The label task selection. -->
    <div
      class="px-4"
      style="display: flex; flex: 1 1 100%;"
    >
      <div
        class="py-2"
        style="width: 25%; height: 40px"
      >
        <span>Label Tasks</span>
      </div>
      <div style="width: 75%;">
        <v-autocomplete
          :value="selectedLabelTasks"
          :items="menuOfLabelTask.options"
          outlined
          dense
          multiple
          full-width
          hide-details
          @input="onUpdateLabelTaskOptions"
        >
          <template #selection="data">
            <v-chip
              v-bind="data.attrs"
              :input-value="data.selected"
              style="text-transform: capitalized"
              small
              label
              outlined
            >
              {{ data.item.label }}
            </v-chip>
          </template>
          <template #item="data">
            <v-list-item-title>
              <v-checkbox
                :label="data.item.label"
                :value="selectedLabelTasks
                  .findIndex((d) => d === data.item.value) >= 0"
                :input-value="selectedLabelTasks
                  .findIndex((d) => d === data.item.value) >= 0"
                class="py-0 ma-0 parameter-panel-checkbox"
                dense
                hide-details
              />
            </v-list-item-title>
          </template>
        </v-autocomplete>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type {
  DataType,
  LabelTaskType,
  WorkflowNode,
} from '@/commons/types';
import dataTypeSetups from '@/builtins/data-types/index';
import labelTaskTypeSetups from '@/builtins/label-task-types/index';
import VNodeEditableLabel from './VNodeEditableLabel.vue';

const getValidLabelTasks = (dataType: DataType): LabelTaskType[] => {
  const setup = dataTypeSetups.find((d) => d.type === dataType);
  return setup?.tasks ?? [];
};

const menuOfDataType = {
  label: 'Data Type',
  options: dataTypeSetups.map((d) => ({
    value: d.type,
    label: d.label,
  })),
};

export default defineComponent({
  name: 'TheNodeDetailsInitialization',
  components: { VNodeEditableLabel },
  props: {
    node: {
      type: Object as PropType<WorkflowNode>,
      default: null,
    },
  },
  emits: {
    'edit:node': null,
  },
  data() {
    return {
      viewTitle: 'Initialization Setting',
      menuOfDataType,
    };
  },
  computed: {
    selectedDataType(): DataType | null {
      if (this.node === null) return null;
      return (this.node.value as { dataType: DataType }).dataType;
    },
    selectedLabelTasks(): LabelTaskType[] {
      if (this.node === null) return [];
      return (this.node.value as { labelTasks: LabelTaskType[] }).labelTasks;
    },
    validLabelTasks(): (LabelTaskType | string)[] {
      const dataType = this.selectedDataType;
      const labelTaskTypes = labelTaskTypeSetups.map((d) => d.type);
      return dataType === null ? labelTaskTypes : getValidLabelTasks(dataType);
    },
    menuOfLabelTask() {
      const { validLabelTasks } = this;
      const options = labelTaskTypeSetups
        .map((d) => ({ value: d.type, label: d.label }));
      return {
        label: 'Label Tasks',
        options: options.filter((d) => validLabelTasks.indexOf(d.value) >= 0),
      };
    },
  },
  methods: {
    onUpdateDataTypeOption(option: DataType): void {
      const { node } = this;
      // Note: when onUpdateDataTypeOption is triggered, this.validLabelTasks
      // have not been updated, thus needs to use getValidLabelTasks.
      const validLabelTasks = getValidLabelTasks(option);
      // Filter the labelTasks by the dataType.
      const selectedLabelTasksFiltered = this.selectedLabelTasks
        .filter((d) => validLabelTasks.indexOf(d) >= 0);
      const nodeValue = node.value as { dataType: DataType, labelTasks: LabelTaskType[] };
      this.onEditNode({
        ...node,
        value: {
          ...nodeValue,
          labelTasks: selectedLabelTasksFiltered,
          dataType: option,
        },
      });
    },
    onUpdateLabelTaskOptions(options: LabelTaskType[]) {
      const { node } = this;
      const nodeValue = node.value as { dataType: DataType, labelTasks: LabelTaskType[] };
      this.onEditNode({
        ...node,
        value: { ...nodeValue, labelTasks: options },
      });
    },
    onEditNode(newValue: WorkflowNode): void {
      this.$emit('edit:node', newValue);
    },
  },
});
</script>
