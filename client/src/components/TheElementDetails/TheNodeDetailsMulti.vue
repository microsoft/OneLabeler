<template>
  <v-card
    :class="classNameOfPanel"
    style="width: 100%; height: 100%;"
    tile
  >
    <div class="view-header">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.parameter
      </v-icon>
      {{ viewTitle }}
      <v-spacer />
    </div>

    <v-divider />

    <!-- The label of the process node. -->
    <div class="py-2 px-4">
      <VNodeEditableLabel
        :label="node.label"
        @edit:label="$emit('edit:node', { ...node, label: $event })"
      />
    </div>

    <!-- The methods used to instantiated the process. -->
    <div class="py-2 px-4">
      <VNodeSelectMethodMultiple
        :selected-methods="selectedMethods"
        :menu="menuOfMethods"
        append-create-option
        @update:selections="onSelectMethods"
        @create:option="$emit('create:method')"
      />
    </div>

    <!-- for each of the selected method -->
    <VMethod
      v-for="(method, i) in selectedMethods"
      :key="i"
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
import Vue, { PropType } from 'vue';
import {
  ModelService,
  Process,
  WorkflowNode,
} from '@/commons/types';
import VNodeEditableLabel from './VNodeEditableLabel.vue';
import VNodeSelectMethodMultiple from './VNodeSelectMethodMultiple.vue';
import VMethod from './VMethod.vue';

export default Vue.extend({
  name: 'TheNodeDetailsMulti',
  components: {
    VNodeEditableLabel,
    VNodeSelectMethodMultiple,
    VMethod,
  },
  props: {
    methods: {
      type: Array as PropType<Process[]>,
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
  data() {
    return {
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
    onEditNode(newValue: WorkflowNode): void {
      this.$emit('edit:node', newValue);
    },
    onSelectMethods(options: Process[]): void {
      const { node } = this;

      // Ensure at most one algorithmic option is chosen.
      const algorithmicIds = options
        .filter((d) => d.isAlgorithmic)
        .map((d) => d.id);
      let newOptions = options;
      if (algorithmicIds.length >= 2) {
        const oldAlgorithmicIds = (node.value as Process[])
          .filter((d) => d.isAlgorithmic)
          .map((d) => d.id);
        newOptions = options.filter((d) => (
          !oldAlgorithmicIds.includes(d.id)
        ));
      }
      this.onEditNode({ ...node, value: newOptions });
    },
    onEditMethod(newValue: Process): void {
      const { node } = this;
      this.onEditNode({
        ...node,
        value: (node.value as Process[]).map((d) => (
          d.id === newValue.id ? newValue : d
        )),
      });
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
