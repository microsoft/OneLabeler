<template>
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
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import templates from '@/builtins/workflow-templates/index';

export default defineComponent({
  name: 'VTemplateMenu',
  emits: {
    'set:workflow': null,
  },
  data() {
    return { templates };
  },
});
</script>
