<template>
  <v-card-title class="view-header">
    <v-icon
      class="px-2"
      aria-hidden="true"
      small
    >
      $vuetify.icons.values.data
    </v-icon>
    Dataset Overview
    <v-spacer />
    <!-- The set projection method menu. -->
    <v-menu offset-y>
      <template #activator="{ on }">
        <v-btn
          x-small
          class="view-header-button subtitle-2"
          width="60"
          v-on="on"
        >
          {{ selectedProjectionMethod }}
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
          v-for="(option, i) in projectionMethodMenu.options"
          :key="i"
          style="min-height: 30px"
          @click="onClickProjectionMethod(option, i)"
        >
          <v-list-item-title
            height="20"
            class="subtitle-2 pa-0 ma-0"
            style="height: 20px"
          >
            {{ projectionMethodMenu.optionsText[i] }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-card-title>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { ProjectionMethod } from './VProjection.vue';

export default Vue.extend({
  name: 'TheProjectionViewHeader',
  props: {
    projectionMethodMenu: {
      type: Object as PropType<{ options: ProjectionMethod[], optionsText: string[] }>,
      required: true,
    },
    selectedProjectionMethod: {
      type: String,
      required: true,
    },
  },
  methods: {
    onClickProjectionMethod(option: ProjectionMethod, i: number) {
      this.$emit('click-projection-method', option, i);
    },
  },
});
</script>
