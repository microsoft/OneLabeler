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
      <v-btn
        title="recompute"
        class="view-header-button mr-1"
        x-small
        icon
        @click="onClickRecompute"
      >
        <v-icon
          aria-hidden="true"
          class="px-0"
          small
        >
          $vuetify.icons.values.sync
        </v-icon>
      </v-btn>
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

        <!-- The name of the method. -->
        <v-list-item class="pt-2">
          <VNodeEditableMethodName
            :title="method.name"
            :disabled="method.isBuiltIn"
            style="width: 100%"
            @edit:title="onEditMethodName"
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

        <!-- The url of the method service. -->
        <v-list-item class="pt-2">
          <v-card
            outlined
            style="width: 100%; display: flex; flex: 1 1 100%;"
          >
            <span class="pl-4 py-2 subtitle-2">
              API
            </span>
            <v-text-field
              :value="method.isServerless ? 'serverless' : method.api"
              :disabled="method.isBuiltIn"
              class="ma-0 px-4 pt-1 subtitle-2"
              style="padding-bottom: 6px !important"
              type="text"
              dense
              hide-details
              single-line
              @input="onInputMethodAPI"
            />
          </v-card>
        </v-list-item>
      </v-list>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { InterimModelTrainingMethod, InterimModelTrainingNode } from '@/commons/types';
import VNodeEditableInput from './VNodeEditableInput.vue';
import VNodeEditableMethodName from './VNodeEditableMethodName.vue';
import VNodeEditableTitle from './VNodeEditableTitle.vue';
import VNodeOutput from './VNodeOutput.vue';
import VNodeSelectMethodSingle from './VNodeSelectMethodSingle.vue';

export default Vue.extend({
  name: 'TheNodeDetailsInterimModelTraining',
  components: {
    VNodeEditableInput,
    VNodeEditableMethodName,
    VNodeEditableTitle,
    VNodeOutput,
    VNodeSelectMethodSingle,
  },
  props: {
    methods: {
      type: Array as PropType<InterimModelTrainingMethod[]>,
      default: [],
    },
    node: {
      type: Object as PropType<InterimModelTrainingNode>,
      default: null,
    },
  },
  data() {
    return {
      viewTitle: 'Interim Model Training Instantiation',
      processInputList: [
        'model',
        'features',
        'labels',
      ],
      processInputListOfRequired: ['model'],
      processOutput: 'model',
      classNameOfPanel: 'parameter-panel',
    };
  },
  computed: {
    method(): InterimModelTrainingMethod {
      return this.node.value.method;
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
    onEditNode(newValue: InterimModelTrainingNode): void {
      this.$emit('edit:node', newValue);
    },
    onUpdateMethodOption(option: InterimModelTrainingMethod): void {
      const { node } = this;
      this.onEditNode({
        ...node,
        value: { method: option },
      });
    },
    onEditMethodName(name: string): void {
      const { node, method } = this;
      const newMethod = { ...method, name };
      this.onEditNode({
        ...node,
        value: { method: newMethod },
      });
      this.onEditMethod(newMethod);
    },
    onInputMethodAPI(api: string): void {
      const { node, method } = this;
      const newMethod = { ...method, api };
      this.onEditNode({
        ...node,
        value: { method: newMethod },
      });
      this.onEditMethod(newMethod);
    },
    onCreateMethod(): void {
      this.$emit('create:method');
    },
    onEditMethod(newValue: InterimModelTrainingMethod): void {
      this.$emit('edit:method', this.node.type, newValue);
    },
    onEditInstanceInputList(inputs: string[]): void {
      const { node, method } = this;
      const newMethod = { ...method, inputs };
      this.onEditNode({
        ...node,
        value: { method: newMethod },
      });
      this.onEditMethod(newMethod);
    },
    onClickRecompute(): void {
      this.$emit('click:recompute', this.node);
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
