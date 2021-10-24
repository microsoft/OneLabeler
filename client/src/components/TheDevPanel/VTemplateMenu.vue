<template>
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn
        class="subtitle-1 text-none px-1"
        color="white"
        plain
        tile
        v-on="on"
      >
        <v-icon
          class="pr-2"
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.diagram
        </v-icon>
        Templates
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="(template, i) in templates"
        :key="i"
        style="min-height: 30px"
        @click="$emit('set:workflow', template)"
      >
        <v-list-item-title
          height="20"
          class="subtitle-2 pa-0 ma-0"
          style="height: 20px"
        >
          {{ template.label }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { WorkflowGraph } from '@/commons/types';
import templates from '@/builtins/workflow-templates/index';

export default Vue.extend({
  name: 'VTemplateMenu',
  props: {
    workflow: {
      type: Object as PropType<WorkflowGraph>,
      required: true,
    },
  },
  data() {
    return { templates };
  },
});
</script>
