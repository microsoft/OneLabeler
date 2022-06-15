<template>
  <v-list dense>
    <v-list-item
      v-for="(template, i) in templates"
      :key="i"
      :disabled="isDisabled(template)"
      class="subtitle-2"
      style="min-height: 30px"
      @click="$emit('set:workflow', template)"
    >
      {{ template.label }}
    </v-list-item>
  </v-list>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import templates from '@/builtins/workflow-templates/index';
import type { WorkflowGraph } from '@/commons/types';

export default defineComponent({
  name: 'VTemplateMenu',
  emits: {
    'set:workflow': null,
  },
  data() {
    return { templates };
  },
  methods: {
    isDisabled(template: WorkflowGraph): boolean {
      const { label } = template;
      return label === 'Point Cloud Classification'
      || label === 'Point Cloud Segmentation'
      || label === 'Text Classification'
      || label === 'Text Named Entity Recognition'
      || label === 'Webpage Classification'
      || label === 'Youtube Video Temporal Segmentation';
    },
  },
});
</script>
