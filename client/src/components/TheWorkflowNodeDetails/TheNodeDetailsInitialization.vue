<template>
  <v-card
    style="width: 100%; height: 100%"
    tile
  >
    <v-card-title class="view-header">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.parameter
      </v-icon>
      {{ viewTitle }}
    </v-card-title>
    <v-divider />
    <v-card-actions class="pa-0">
      <v-list
        style="width: 100%"
        dense
        subheader
      >
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
            <v-list dense>
              <v-list-item
                v-for="(option, i) in menuOfDataType.options"
                :key="i"
                @click="onUpdateDataTypeOption(option.value)"
              >
                <v-list-item-title class="subtitle-2">
                  {{ option.label }}
                </v-list-item-title>
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
            style="width: 16%; height: 40px"
          >
            <span>Label Tasks</span>
          </div>
          <div style="width: 84%;">
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
      </v-list>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  DataType,
  LabelTaskType,
  WorkflowNode,
} from '@/commons/types';
import dataTypeSetups from '@/builtins/data-types/index';

export default Vue.extend({
  name: 'TheNodeDetailsInitialization',
  props: {
    node: {
      type: Object as PropType<WorkflowNode>,
      default: null,
    },
  },
  data() {
    return {
      viewTitle: 'Initialization Setting',
    };
  },
  computed: {
    menuOfDataType() {
      return {
        label: 'Data Type',
        options: dataTypeSetups.map((d) => ({
          value: d.type,
          label: d.label,
        })),
      };
    },
    selectedDataType(): DataType | null {
      if (this.node === null) return null;
      return (this.node.value as { dataType: DataType }).dataType;
    },
    selectedLabelTasks(): LabelTaskType[] {
      if (this.node === null) return [];
      return (this.node.value as { labelTasks: LabelTaskType[] }).labelTasks;
    },
    validLabelTasks(): LabelTaskType[] {
      if (this.selectedDataType === null) {
        return [
          LabelTaskType.Classification,
          LabelTaskType.FreeformText,
          LabelTaskType.ObjectDetection,
          LabelTaskType.Segmentation,
          LabelTaskType.SpanClassification,
        ];
      }
      const dataTypeSetup = dataTypeSetups
        .find((d) => d.type === this.selectedDataType);
      if (dataTypeSetup === undefined) return [];
      return dataTypeSetup.tasks;
    },
    menuOfLabelTask() {
      const { validLabelTasks } = this;
      const options = [
        { value: LabelTaskType.Classification, label: 'Classification' },
        { value: LabelTaskType.FreeformText, label: 'Freeform Text' },
        { value: LabelTaskType.ObjectDetection, label: 'Object Detection' },
        { value: LabelTaskType.Segmentation, label: 'Segmentation' },
        { value: LabelTaskType.SpanClassification, label: 'Span Tagging' },
      ];
      return {
        label: 'Label Tasks',
        options: options.filter((d) => validLabelTasks.indexOf(d.value) >= 0),
      };
    },
  },
  methods: {
    onUpdateDataTypeOption(option: DataType): void {
      const { node } = this;
      // Filter the labelTasks by the dataType.
      const selectedLabelTasksFiltered = this.selectedLabelTasks.filter((d) => (
        this.validLabelTasks.indexOf(d) >= 0
      ));
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
