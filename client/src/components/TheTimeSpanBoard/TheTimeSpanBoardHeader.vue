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
        $vuetify.icons.values.fileVideo
      </v-icon>
      Video
    </template>
    <template #tools>
      <template v-if="enableClassification">
        <v-divider
          class="mx-2"
          vertical
        />
        <!-- The data object label menu. -->
        <VCategorySingleTool
          :label-category="label === null ? null : label.category"
          :classes="classes"
          :button-color="label === null ? null : label2color(label.category)"
          :disabled="label === null"
          @set:label-category="onSetLabelCategory"
        />
      </template>

      <template v-if="enableMultiLabelClassification">
        <v-divider
          class="mx-2"
          vertical
        />
        <!-- The data object label menu. -->
        <VMultiCategorySingleTool
          :label-multi-category="label === null ? null : label.multiCategory"
          :classes="classes"
          :disabled="label === null"
          @set:label-multi-category="onSetLabelMultiCategory"
        />
      </template>

      <template v-if="enableFreeformText">
        <v-divider
          class="mx-2"
          vertical
        />
        <!-- The create/edit freeform text annotation button. -->
        <VFreeformTextSingleTool
          :label-text="label === null ? null : label.text"
          :disabled="label === null"
          @set:label-text="onSetLabelText"
        />
      </template>
    </template>
  </VToolbar>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Category,
  ILabel,
  ILabelCategory,
  ILabelMultiCategory,
  ILabelText,
  LabelTaskType,
} from '@/commons/types';
import VToolbar from '@/components/VWindow/VToolbar.vue';
import VCategorySingleTool from '@/components/VLabelCategory/VSingleTool.vue';
import VMultiCategorySingleTool from '@/components/VLabelMultiCategory/VSingleTool.vue';
import VFreeformTextSingleTool from '@/components/VLabelFreeformText/VSingleTool.vue';

export default Vue.extend({
  name: 'TheTimeSpanBoardHeader',
  components: {
    VToolbar,
    VCategorySingleTool,
    VMultiCategorySingleTool,
    VFreeformTextSingleTool,
  },
  props: {
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    classes: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(category: string) => string>,
      required: true,
    },
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
  },
  computed: {
    enableClassification(): boolean {
      return this.labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.Classification,
      ) >= 0;
    },
    enableMultiLabelClassification(): boolean {
      return this.labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.MultiLabelClassification,
      ) >= 0;
    },
    enableFreeformText(): boolean {
      return this.labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.FreeformText,
      ) >= 0;
    },
  },
  methods: {
    onSetLabelCategory(category: ILabelCategory): void {
      this.$emit('set:label-category', category);
    },
    onSetLabelMultiCategory(multiCategory: ILabelMultiCategory): void {
      this.$emit('set:label-multi-category', multiCategory);
    },
    onSetLabelText(text: ILabelText): void {
      this.$emit('set:label-text', text);
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
