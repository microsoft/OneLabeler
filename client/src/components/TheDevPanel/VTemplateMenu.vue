<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

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
        class="subtitle-2"
        style="min-height: 30px"
        @click="$emit('set:workflow', template)"
      >
        {{ template.label }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { WorkflowGraph } from '@/commons/types';
import templates from '@/builtins/workflow-templates/index';

export default defineComponent({
  name: 'VTemplateMenu',
  props: {
    workflow: {
      type: Object as PropType<WorkflowGraph>,
      required: true,
    },
  },
  emits: {
    'set:workflow': null,
  },
  data() {
    return { templates };
  },
});
</script>
