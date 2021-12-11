<template>
  <div class="card-elevated">
    <div class="card-header">
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

    <!-- The node name label. -->
    <VNodeEditableLabel
      :label="node.label"
      class="py-2 px-4"
      @edit:label="$emit('edit:node', { ...node, label: $event })"
    />

    <!-- The node type label. -->
    <div
      class="py-2 px-4"
      style="display: flex"
    >
      Node Type
      <span class="pl-4 subtitle-2">
        {{ node.type }}
      </span>
    </div>

    <!-- The method used to instantiated the process. -->
    <VNodeSelectMethod
      v-if="!isInit && !isDecision && !isExit"
      :selected-method="method"
      :menu="menuOfMethods"
      append-create-option
      class="py-2 px-4"
      @update:selection="$emit('edit:node', { ...node, value: $event })"
      @create:option="$emit('create:module')"
    />

    <v-divider class="py-1" />

    <!-- The hyperparameters chosen for the selected module instance. -->
    <VModule
      v-if="method !== null"
      :method="method"
      :models="models"
      :module-inputs="moduleInputs"
      :module-outputs="moduleOutputs"
      @update:module="onEditMethod"
      @edit:model="$emit('edit:model', $event)"
      @create:model="$emit('create:model')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { WorkflowNodeType } from '@/commons/types';
import type {
  ModelService,
  IModule,
  WorkflowNode,
} from '@/commons/types';
import VNodeEditableLabel from './VNodeEditableLabel.vue';
import VNodeSelectMethod from './VNodeSelectMethod.vue';
import VModule from './VModule.vue';

export default defineComponent({
  name: 'TheNodeDetailsModule',
  components: {
    VNodeEditableLabel,
    VNodeSelectMethod,
    VModule,
  },
  props: {
    methods: {
      type: Array as PropType<IModule[]>,
      default: () => [],
    },
    models: {
      type: Array as PropType<ModelService[]>,
      default: () => [],
    },
    node: {
      type: Object as PropType<WorkflowNode>,
      default: null,
    },
    viewTitle: {
      type: String as PropType<string>,
      default: '',
    },
    moduleInputs: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    moduleOutputs: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  emits: {
    'edit:node': null,
    'update:module': null,
    'create:module': null,
    'edit:model': null,
    'create:model': null,
  },
  computed: {
    isInit(): boolean {
      return this.node.type === WorkflowNodeType.Initialization;
    },
    isDecision(): boolean {
      return this.node.type === WorkflowNodeType.Decision;
    },
    isExit(): boolean {
      return this.node.type === WorkflowNodeType.Exit;
    },
    method(): IModule | null {
      return this.node.value as IModule | null;
    },
    menuOfMethods(): { label: string, options: { value: IModule, label: string }[] } {
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
    onEditMethod(newValue: IModule): void {
      this.$emit('edit:node', { ...this.node, value: newValue });
      this.$emit('update:module', newValue);
    },
  },
});
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/main.sass';
.card {
  background-color: white;
  border: thin solid rgba(0,0,0,.12);
  border-radius: 4px;
}
.card-elevated {
  @extend .elevation-2;
  @extend .card;
}
</style>
