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
      <v-spacer />
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

        <!-- The methods used to instantiated the process. -->
        <v-list-item>
          <VNodeSelectMethodMultiple
            :selected-methods="selectedMethods"
            :menu="menuOfMethods"
            :append-create-option="false"
            @update:selections="onUpdateMethodOptions"
          />
        </v-list-item>

        <!-- for each of the selected method -->
        <v-container
          v-for="(method, i) in selectedMethods"
          :key="i"
          class="pa-0 pt-2 pb-0"
        >
          <v-divider />

          <!-- The label of the method. -->
          <v-list-item class="pt-2">
            <VNodeEditableMethodLabel
              :label="method.label"
              :disabled="method.isBuiltIn"
              style="width: 100%"
              @edit:label="onEditMethodLabel(method, $event)"
            />
          </v-list-item>

          <!-- The input and output of the process. -->
          <v-list-item class="pt-2">
            <v-row>
              <v-col
                class="pr-0"
                style="width: 70%; max-width: 70%; flex-basis: 70%;"
              >
                <!-- The input box for process input parameters. -->
                <VNodeEditableInput
                  :process-input-list="processInputList"
                  :process-input-list-of-required="processInputListOfRequired"
                  :instance-input-list="method.inputs"
                  :disabled="method.isBuiltIn"
                  @edit:list="onEditInstanceInputList(method, $event)"
                />
              </v-col>
              <v-col style="width: 30%; max-width: 30%; flex-basis: 30%">
                <!-- The display of process output parameters. -->
                <VNodeOutput :process-output="processOutput" />
              </v-col>
            </v-row>
          </v-list-item>

          <template v-if="method.params !== undefined">
            <v-list-item class="pt-2">
              <VNodeMethodParams
                :params="method.params"
                style="width: 100%"
                @click:param-option="onClickMethodParam(
                  method,
                  $event.paramKey,
                  $event.option,
                )"
              />
            </v-list-item>
          </template>
        </v-container>
      </v-list>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  MethodParams,
  Process,
  WorkflowNode,
} from '@/commons/types';
import VNodeEditableInput from './VNodeEditableInput.vue';
import VNodeEditableMethodLabel from './VNodeEditableMethodLabel.vue';
import VNodeEditableLabel from './VNodeEditableLabel.vue';
import VNodeMethodParams from './VNodeMethodParams.vue';
import VNodeOutput from './VNodeOutput.vue';
import VNodeSelectMethodMultiple from './VNodeSelectMethodMultiple.vue';

export default Vue.extend({
  name: 'TheNodeDetailsInteractiveLabeling',
  components: {
    VNodeEditableInput,
    VNodeEditableMethodLabel,
    VNodeEditableLabel,
    VNodeMethodParams,
    VNodeOutput,
    VNodeSelectMethodMultiple,
  },
  props: {
    methods: {
      type: Array as PropType<Process[]>,
      default: () => [],
    },
    node: {
      type: Object as PropType<WorkflowNode>,
      default: null,
    },
  },
  data() {
    return {
      viewTitle: 'Interactive Labeling Instantiation',
      processInputList: ['dataObjects', 'samples'],
      processInputListOfRequired: ['dataObjects', 'samples'],
      processOutput: 'labels',
      classNameOfPanel: 'parameter-panel',
    };
  },
  computed: {
    selectedMethods(): Process[] {
      return this.node.value as Process[];
    },
    menuOfMethods() {
      return {
        label: 'Selected Method',
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
    onUpdateMethodOptions(options: Process[]): void {
      const { node } = this;
      this.onEditNode({
        ...node,
        value: options,
      });
    },
    onClickMethodParam(
      method: Process,
      paramKey: string,
      option: { value: unknown, label: string },
    ): void {
      const { node } = this;
      const { params } = method;
      const newMethod = {
        ...method,
        params: {
          ...params,
          [paramKey]: {
            ...(params as MethodParams)[paramKey],
            value: option.value,
          },
        },
      };
      this.onEditNode({
        ...node,
        value: (node.value as Process[]).map((d) => (
          d.id === method.id ? newMethod : d
        )),
      });
      this.onEditMethod(newMethod);
    },
    onEditMethod(newValue: Process): void {
      this.$emit('edit:method', newValue);
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
