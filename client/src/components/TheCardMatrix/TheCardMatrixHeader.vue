<template>
  <VToolbar
    @window:minimize="onClickMinimize"
    @window:pin="onClickPin"
  >
    <template #title>
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.image
      </v-icon>
      Sampled Objects
    </template>
    <template #tools>
      <template v-if="enableClassification">
        <!-- The data object label menu. -->
        <VCategoryBatchTool
          :classes="classes"
          :unlabeled-mark="unlabeledMark"
          :label2color="label2color"
          @set:category="onSetLabelBatchCategory"
        />
      </template>
    </template>
  </VToolbar>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Category, LabelTaskType } from '@/commons/types';
import VToolbar from '@/components/VWindow/VToolbar.vue';
import VCategoryBatchTool from '@/components/VLabelCategory/VBatchTool.vue';

export default Vue.extend({
  name: 'TheCardMatrixHeader',
  components: {
    VToolbar,
    VCategoryBatchTool,
  },
  props: {
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    classes: {
      type: Array as PropType<Category[]>,
      default: () => [],
    },
    unlabeledMark: {
      type: String as PropType<Category>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  computed: {
    enableClassification(): boolean {
      return this.labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.Classification,
      ) >= 0;
    },
  },
  methods: {
    onSetLabelBatchCategory(category: Category): void {
      this.$emit('set:label-batch-category', category);
    },
    onClickMinimize() {
      this.$emit('window:minimize');
    },
    onClickPin() {
      this.$emit('window:pin');
    },
  },
});
</script>
