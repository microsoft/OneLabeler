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
  ILabelText,
  LabelTaskType,
  StatusType,
} from '@/commons/types';
import VCategorySingleTool from '@/components/VLabelCategory/VSingleTool.vue';
import VFreeformTextSingleTool from '@/components/VLabelFreeformText/VSingleTool.vue';

export default Vue.extend({
  name: 'VDataObjectCardHeader',
  components: {
    VCategorySingleTool,
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
    enableFreeformText(): boolean {
      return this.labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.FreeformText,
      ) >= 0;
    },
  },
  methods: {
    onSetLabelCategory(category: Category): void {
      this.$emit('set:label-category', category);
    },
    onSetLabelText(text: ILabelText) {
      this.$emit('set:label-text', text);
    },
  },
});
</script>
