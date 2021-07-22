<template>
  <VToolbar
    @window:minimize="$emit('window:minimize')"
    @window:pin="$emit('window:pin')"
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
      <template v-if="includesClassification">
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
    </template>
  </VToolbar>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Category,
  ILabel,
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
    includesClassification(): boolean {
      return this.labelTasks.includes(LabelTaskType.Classification);
    },
    includesMultiLabelClassification(): boolean {
      return this.labelTasks.includes(LabelTaskType.MultiLabelClassification);
    },
    includesFreeformText(): boolean {
      return this.labelTasks.includes(LabelTaskType.FreeformText);
    },
  },
});
</script>
