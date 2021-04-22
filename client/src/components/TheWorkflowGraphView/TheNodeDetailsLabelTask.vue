<template>
  <v-card
    style="width: 100%; height: 100%"
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
    </v-card-title>
    <v-divider />
    <v-card-actions class="pa-0">
      <VNodeMethodParams
        :params="menus"
        :outlined="false"
        style="width: 100%"
        @click:param-option="onClickMenuOption"
      />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { LabelTaskType } from '@/commons/types';
import { LabelTaskNode } from './types';
import VNodeMethodParams from './VNodeMethodParams.vue';

export default Vue.extend({
  name: 'TheNodeDetails',
  components: {
    VNodeMethodParams,
  },
  props: {
    node: {
      type: Object as PropType<LabelTaskNode>,
      default: null,
    },
  },
  data() {
    return {
      viewTitle: 'Label Task Setting',
    };
  },
  computed: {
    menus() {
      const { node } = this;
      const enableClassification = node.value
        .findIndex((d) => d === LabelTaskType.Classification) >= 0;
      const enableObjectDetection = node.value
        .findIndex((d) => d === LabelTaskType.ObjectDetection) >= 0;
      const enableSegmentation = node.value
        .findIndex((d) => d === LabelTaskType.Segmentation) >= 0;
      const menus = {
        Classification: {
          value: enableClassification,
          title: 'Classification',
          options: [
            { value: false, text: 'No' },
            { value: true, text: 'Yes' },
          ],
        },
        ObjectDetection: {
          value: enableObjectDetection,
          title: 'Object Detection',
          options: [
            { value: false, text: 'No' },
            { value: true, text: 'Yes' },
          ],
        },
        Segmentation: {
          value: enableSegmentation,
          title: 'Segmentation',
          options: [
            { value: false, text: 'No' },
            { value: true, text: 'Yes' },
          ],
        },
      };
      return menus;
    },
  },
  methods: {
    onClickMenuOption({ paramName, option }: {
      paramName: string,
      option: { value: boolean, text: string },
    }): void {
      const { node } = this;
      let labelTasks = [...(node.value as LabelTaskType[])];
      const clickedLabelTask = {
        Classification: LabelTaskType.Classification,
        ObjectDetection: LabelTaskType.ObjectDetection,
        Segmentation: LabelTaskType.Segmentation,
      }[paramName] as LabelTaskType;
      const idx = labelTasks.findIndex((d) => d === clickedLabelTask);
      if (option.value === true && !(idx >= 0)) {
        labelTasks = [...labelTasks, clickedLabelTask];
      } else if (option.value === false && idx >= 0) {
        labelTasks.splice(idx, 1);
      }
      this.onEditNode({
        ...node,
        value: labelTasks,
      });
    },
    onEditNode(newValue: LabelTaskNode): void {
      this.$emit('edit:node', newValue);
    },
  },
});
</script>
