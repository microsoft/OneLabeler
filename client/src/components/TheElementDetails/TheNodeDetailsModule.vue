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

    <!-- The method used to instantiated the process. -->
    <VNodeSelectMethod
      v-if="!isInit"
      :selected-method="method"
      :menu="menuOfMethods"
      append-create-option
      class="py-2 px-4"
      @update:selection="$emit('edit:node', { ...node, value: $event })"
      @create:option="$emit('create:method')"
    />

    <v-divider class="py-1" />

    <!-- The hyperparameters chosen for the selected module instance. -->
    <VMethod
      v-if="method !== null"
      :method="method"
      :models="models"
      :module-inputs="moduleInputs"
      :module-outputs="moduleOutputs"
      @edit:method="onEditMethod"
      @edit:model="$emit('edit:model', $event)"
      @create:model="$emit('create:model')"
    />
  </v-card>
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
import VMethod from './VMethod.vue';

export default defineComponent({
  name: 'TheNodeDetailsModule',
  components: {
    VNodeEditableLabel,
    VNodeSelectMethod,
    VMethod,
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
    'edit:method': null,
    'create:method': null,
    'edit:model': null,
    'create:model': null,
  },
  computed: {
    isInit(): boolean {
      return this.node.type === WorkflowNodeType.Initialization;
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
      this.$emit('edit:method', newValue);
    },
  },
});
</script>
