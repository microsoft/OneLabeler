<template>
  <div
    class="subtitle-1 grey darken-1"
    style="display: flex; align-items: center; user-select: none;"
  >
    {{ title }}
    <v-icon
      v-if="isLabeled"
      class="px-2"
      color="white"
      aria-hidden="true"
      style="font-size:12px; width: 1.5rem;"
      small
    >
      $vuetify.icons.values.verified
    </v-icon>

    <div style="flex-grow: 1" />

    <template v-if="enableClassification">
      <!-- The data object label menu. -->
      <VCategorySingleTool
        :label-category="label === null ? null : label.category"
        :classes="classes"
        :button-color="buttonColor"
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
        :label-multi-category="label === null ? null : label.categories"
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
  </div>
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
  StatusType,
} from '@/commons/types';
import VCategorySingleTool from '@/components/VLabelCategory/VSingleTool.vue';
import VMultiCategorySingleTool from '@/components/VLabelMultiCategory/VSingleTool.vue';
import VFreeformTextSingleTool from '@/components/VLabelFreeformText/VSingleTool.vue';

export default Vue.extend({
  name: 'VDataObjectCardHeader',
  components: {
    VCategorySingleTool,
    VMultiCategorySingleTool,
    VFreeformTextSingleTool,
  },
  props: {
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    label: {
      type: Object as PropType<ILabel | undefined>,
      default: undefined,
      required: false,
    },
    status: {
      type: String as PropType<StatusType>,
      required: true,
    },
    classes: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    buttonColor: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  computed: {
    isLabeled(): boolean {
      return this.status === StatusType.Labeled;
    },
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
    onSetLabelText(text: ILabelText) {
      this.$emit('set:label-text', text);
    },
  },
});
</script>
