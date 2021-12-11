<template>
  <div class="card">
    <div class="card-header">
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
    <div
      class="my-2"
      style="display: flex; flex-direction: column; gap: 8px;"
    >
      <!-- The source node. -->
      <div class="card mx-2">
        <div class="card card-header px-2">
          <span
            class="subtitle-2"
            style="padding-bottom: 7.4px; padding-top: 7px"
          >
            Source Node
          </span>
        </div>
      </div>

      <div
        class="card mx-2"
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
      </div>

      <!-- The target node. -->
      <div class="card mx-2">
        <div class="card card-header px-2">
          <span
            class="subtitle-2"
            style="padding-bottom: 7.4px; padding-top: 7px"
          >
            Target Node
          </span>
        </div>
      </div>

      <div
        class="card mx-2"
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
      </div>

      <!-- The condition -->
      <template v-if="'condition' in edge">
        <v-divider />
        <div
          class="card mx-2 px-2"
          style="display: flex"
        >
          <span class="py-2 subtitle-2">
            Branch
          </span>
          <v-spacer />
          <v-menu offset-y>
            <template #activator="{ on }">
              <v-btn
                class="subtitle-2 text-none"
                style="border-color: #e0e0e0; align-self: center;"
                small
                outlined
                v-on="on"
              >
                {{ edge.condition }}
              </v-btn>
            </template>
            <v-list
              class="subtitle-2"
              dense
            >
              <v-list-item @click="updateCondition(true)">
                true
              </v-list-item>
              <v-list-item @click="updateCondition(false)">
                false
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { WorkflowEdge } from '@/commons/types';

export default defineComponent({
  name: 'TheEdgeDetails',
  props: {
    edge: {
      type: Object as PropType<WorkflowEdge>,
      default: null,
    },
  },
  emits: {
    'edit:edge': null,
  },
  data() {
    return {
      viewTitle: 'Edge',
    };
  },
  methods: {
    updateCondition(condition: boolean): void {
      this.$emit('edit:edge', { ...this.edge, condition });
    },
  },
});
</script>

<style lang="scss" scoped>
.card {
  background-color: white;
  border: thin solid rgba(0,0,0,.12) !important;
  border-radius: 4px;
}
</style>
