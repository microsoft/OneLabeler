<template>
  <v-card
    :class="`fill-height ${classNameOfPanel}`"
    style="width: 100%"
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
      <v-list
        style="width: 100%"
        dense
        subheader
      >

        <!-- The source node. -->
        <v-list-item class="pt-2">
          <v-card
            flat
            outlined
            style="width: 100%"
          >
            <v-card-title class="view-header px-2">
              <span class="subtitle-2" style="padding-bottom: 7.4px; padding-top: 7px">
                Source Node
              </span>
            </v-card-title>
          </v-card>
        </v-list-item>

        <v-list-item class="pt-2">
          <v-card
            outlined
            style="width: 100%; display: flex; flex: 1 1 100%;"
          >
            <span class="pl-4 py-2 subtitle-2">
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
        </v-list-item>

        <!-- The target node. -->
        <v-list-item class="pt-2">
          <v-card
            flat
            outlined
            style="width: 100%"
          >
            <v-card-title class="view-header px-2">
              <span class="subtitle-2" style="padding-bottom: 7.4px; padding-top: 7px">
                Target Node
              </span>
            </v-card-title>
          </v-card>
        </v-list-item>

        <v-list-item class="pt-2">
          <v-card
            outlined
            style="width: 100%; display: flex; flex: 1 1 100%;"
          >
            <span class="pl-4 py-2 subtitle-2">
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
        </v-list-item>
      </v-list>
    </v-card-actions>
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
