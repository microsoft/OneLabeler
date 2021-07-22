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

    <template v-if="includesClassification">
      <!-- The data object label menu. -->
      <VCategorySingleTool
        :label-category="label === null ? null : label.category"
        :classes="classes"
        :button-color="buttonColor"
        :disabled="label === null"
        @set:label-category="$emit('set:label-category', $event)"
      />
    </template>

    <template v-if="includesMultiLabelClassification">
      <v-divider
        class="mx-2"
        vertical
      />
      <!-- The data object label menu. -->
      <VMultiCategorySingleTool
        :label-multi-category="label === null ? null : label.multiCategory"
        :classes="classes"
        :disabled="label === null"
        @set:label-multi-category="$emit('set:label-multi-category', $event)"
      />
    </template>

    <template v-if="includesFreeformText">
      <v-divider
        class="mx-2"
        vertical
      />
      <!-- The create/edit freeform text annotation button. -->
      <VFreeformTextSingleTool
        :label-text="label === null ? null : label.text"
        :disabled="label === null"
        @set:label-text="$emit('set:label-text', $event)"
      />
    </template>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Category,
  ILabel,
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
    includesClassification(): boolean {
      return this.labelTasks.includes(LabelTaskType.Classification);
    },
    includesMultiLabelClassification(): boolean {
      return this.labelTasks.includes(LabelTaskType.MultiLabelClassification);
    },
    includesFreeformText(): boolean {
      return this.labelTasks.includes(LabelTaskType.FreeformText);
    },
    isLabeled(): boolean {
      return this.status === StatusType.Labeled;
    },
  },
});
</script>
