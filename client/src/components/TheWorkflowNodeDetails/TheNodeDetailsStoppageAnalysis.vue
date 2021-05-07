<template>
  <v-card
    :class="`fill-height ${classNameOfPanel}`"
    style="width: 100%"
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
        <!-- The label of the process node. -->
        <v-list-item>
          <VNodeEditableLabel
            :label="node.label"
            @edit:label="onEditNodeLabel"
          />
        </v-list-item>

        <!-- The method used to instantiated the process. -->
        <v-list-item>
          <VNodeSelectMethodSingle
            :selected-method="method"
            :menu="menuOfMethods"
            append-create-option
            @update:selection="onUpdateMethodOption"
            @create:option="onCreateMethod"
          />
        </v-list-item>

        <v-divider />

        <template v-if="method !== null">

          <!-- The label of the feature extraction method. -->
          <v-list-item class="pt-2">
            <VNodeEditableMethodLabel
              :label="method.label"
              :disabled="method.isBuiltIn"
              style="width: 100%"
              @edit:label="onEditMethodLabel"
            />
          </v-list-item>

          <!-- The input and output of the process. -->
          <v-list-item class="pt-2">
            <v-row>
              <v-col
                class="pr-0"
                style="width: 75%; max-width: 75%; flex-basis: 75%;"
              >
                <!-- The input box for process input parameters. -->
                <VNodeEditableInput
                  :process-input-list="processInputList"
                  :process-input-list-of-required="processInputListOfRequired"
                  :instance-input-list="method.inputs"
                  :disabled="method.isBuiltIn"
                  @edit:list="onEditInstanceInputList"
                />
              </v-col>
              <v-col style="width: 25%; max-width: 25%; flex-basis: 25%">
                <!-- The display of process output parameters. -->
                <VNodeOutput :process-output="processOutput" />
              </v-col>
            </v-row>
          </v-list-item>

        </template>
      </v-list>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Process, WorkflowNode } from '@/commons/types';
import VNodeEditableInput from './VNodeEditableInput.vue';
import VNodeEditableMethodLabel from './VNodeEditableMethodLabel.vue';
import VNodeEditableLabel from './VNodeEditableLabel.vue';
import VNodeOutput from './VNodeOutput.vue';
import VNodeSelectMethodSingle from './VNodeSelectMethodSingle.vue';

export default Vue.extend({
  name: 'TheNodeDetailsStoppageAnalysis',
  components: {
    VNodeEditableInput,
    VNodeEditableMethodLabel,
    VNodeEditableLabel,
    VNodeOutput,
    VNodeSelectMethodSingle,
  },
  props: {
    methods: {
      type: Array as PropType<Process[]>,
      default: [],
    },
    node: {
      type: Object as PropType<WorkflowNode>,
      default: null,
    },
  },
  data() {
    return {
      viewTitle: 'Stoppage Analysis Instantiation',
      processInputList: [
        'labels',
        'model',
        'features',
        'dataObjects',
      ],
      processInputListOfRequired: ['labels'],
      processOutput: 'stop',
      classNameOfPanel: 'parameter-panel',
    };
  },
  computed: {
    method(): Process | null {
      return this.node.value as Process | null;
    },
    menuOfMethods() {
      return {
        label: 'Method',
        options: this.methods.map((d) => ({
          value: d,
          label: d.label,
        })),
      };
    },
  },
  methods: {
    onEditNodeLabel(label: string): void {
      const { node } = this;
      this.onEditNode({ ...node, label });
    },
    onEditNode(newValue: WorkflowNode): void {
      this.$emit('edit:node', newValue);
    },
    onUpdateMethodOption(option: Process): void {
      const { node } = this;
      this.onEditNode({ ...node, value: option });
    },
    onEditMethodLabel(label: string): void {
      if (this.method === null) return;
      const { node, method } = this;
      const newMethod: Process = { ...method, label };
      this.onEditNode({ ...node, value: newMethod });
      this.onEditMethod(newMethod);
    },
    onInputMethodAPI(api: string): void {
      if (this.method === null) return;
      const { node, method } = this;
      const newMethod: Process = { ...method, api };
      this.onEditNode({ ...node, value: newMethod });
      this.onEditMethod(newMethod);
    },
    onCreateMethod(): void {
      this.$emit('create:method');
    },
    onEditMethod(newValue: Process): void {
      this.$emit('edit:method', newValue);
    },
    onEditInstanceInputList(inputs: string[]): void {
      if (this.method === null) return;
      const { node, method } = this;
      const newMethod: Process = { ...method, inputs };
      this.onEditNode({ ...node, value: newMethod });
      this.onEditMethod(newMethod);
    },
  },
});
</script>
<style>
/** Make the letter spacing of v-text-field the same as text outside. */
.parameter-panel input {
  letter-spacing: .0071428571em;
}
</style>
