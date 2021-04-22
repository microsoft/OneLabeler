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
        <!-- The name of the process node. -->
        <v-list-item>
          <VNodeEditableTitle
            :title="node.title"
            @edit:title="onEditNodeTitle"
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

          <!-- The name of the method. -->
           <v-list-item class="pt-2">
            <VNodeEditableMethodName
              :title="method.name"
              :disabled="method.isBuiltIn"
              style="width: 100%"
              @edit:title="onEditMethodName(method, $event)"
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
                  @edit:list="onEditInstanceInputList(method, $event)"
                />
              </v-col>
              <v-col style="width: 25%; max-width: 25%; flex-basis: 25%">
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
                  $event.paramName,
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
  InteractiveLabelingMethod,
  InteractiveLabelingNode,
  MethodParams,
} from '@/commons/types';
import VNodeEditableInput from './VNodeEditableInput.vue';
import VNodeEditableMethodName from './VNodeEditableMethodName.vue';
import VNodeEditableTitle from './VNodeEditableTitle.vue';
import VNodeMethodParams from './VNodeMethodParams.vue';
import VNodeOutput from './VNodeOutput.vue';
import VNodeSelectMethodMultiple from './VNodeSelectMethodMultiple.vue';

export default Vue.extend({
  name: 'TheNodeDetailsInteractiveLabeling',
  components: {
    VNodeEditableInput,
    VNodeEditableMethodName,
    VNodeEditableTitle,
    VNodeMethodParams,
    VNodeOutput,
    VNodeSelectMethodMultiple,
  },
  props: {
    methods: {
      type: Array as PropType<InteractiveLabelingMethod[]>,
      default: () => [],
    },
    node: {
      type: Object as PropType<InteractiveLabelingNode>,
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
    selectedMethods(): InteractiveLabelingMethod[] {
      return this.node.value.map((d) => d.method);
    },
    menuOfMethods() {
      return {
        title: 'Method',
        options: this.methods.map((d) => ({
          value: d,
          text: d.name,
        })),
      };
    },
  },
  methods: {
    onEditNodeTitle(title: string): void {
      const { node } = this;
      this.onEditNode({ ...node, title });
    },
    onEditNode(newValue: InteractiveLabelingNode): void {
      this.$emit('edit:node', newValue);
    },
    onUpdateMethodOptions(options: InteractiveLabelingMethod[]): void {
      const { node } = this;
      this.onEditNode({
        ...node,
        value: options.map((d) => ({ method: d })),
      });
    },
    onClickMethodParam(
      method: InteractiveLabelingMethod,
      paramName: string,
      option: { value: unknown, text: string },
    ): void {
      const { node } = this;
      const { params } = method;
      const newMethod = {
        ...method,
        params: {
          ...params,
          [paramName]: {
            ...(params as MethodParams)[paramName],
            value: option.value,
          },
        },
      };
      this.onEditNode({
        ...node,
        value: node.value.map((d) => (
          d.method.id === method.id
            ? { method: newMethod }
            : d
        )),
      });
      this.onEditMethod(newMethod);
    },
    onEditMethod(newValue: InteractiveLabelingMethod): void {
      this.$emit('edit:method', this.node.type, newValue);
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
