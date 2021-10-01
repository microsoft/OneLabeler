<template>
  <v-card
    :class="`fill-height ${classNameOfPanel}`"
    style="width: 100%"
    tile
  >
    <div class="view-header">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.parameter
      </v-icon>
      {{ viewTitle }}
    </div>
    <v-divider />
    <div class="pt-2">
      <!-- The source node. -->
      <v-card
        flat
        outlined
        class="mx-4"
      >
        <div class="view-header px-2">
          <span
            class="subtitle-2"
            style="padding-bottom: 7.4px; padding-top: 7px"
          >
            Source Node
          </span>
        </div>
      </v-card>

      <v-card
        outlined
        class="mt-2 mx-4"
        style="display: flex"
      >
        <span class="pl-2 py-2 subtitle-2">
          ID
        </span>
        <v-text-field
          :value="edge.source"
          disabled
          class="ma-0 px-4 pt-1 subtitle-2"
          style="padding-bottom: 6px !important"
          type="text"
          dense
          hide-details
          single-line
        />
      </v-card>

      <!-- The target node. -->
      <v-card
        flat
        outlined
        class="mt-2 mx-4"
      >
        <div class="view-header px-2">
          <span
            class="subtitle-2"
            style="padding-bottom: 7.4px; padding-top: 7px"
          >
            Target Node
          </span>
        </div>
      </v-card>

      <v-card
        outlined
        class="mt-2 mx-4"
        style="display: flex"
      >
        <span class="pl-2 py-2 subtitle-2">
          ID
        </span>
        <v-text-field
          :value="edge.target"
          disabled
          class="ma-0 px-4 pt-1 subtitle-2"
          style="padding-bottom: 6px !important"
          type="text"
          dense
          hide-details
          single-line
        />
      </v-card>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { WorkflowEdge } from '@/commons/types';

export default Vue.extend({
  name: 'TheEdgeDetails',
  props: {
    edge: {
      type: Object as PropType<WorkflowEdge>,
      default: null,
    },
  },
  data() {
    return {
      viewTitle: 'Edge',
      classNameOfPanel: 'parameter-panel',
    };
  },
});
</script>
<style>
/** Make the letter spacing of v-text-field the same as text outside. */
.parameter-panel input {
  letter-spacing: .0071428571em;
}
</style>
