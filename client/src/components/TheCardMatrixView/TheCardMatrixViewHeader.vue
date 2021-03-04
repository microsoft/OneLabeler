<template>
  <v-card-title class="view-header">
    <v-icon
      class="px-2"
      aria-hidden="true"
      small
    >
      $vuetify.icons.values.image
    </v-icon>
    Sampled Object
    <v-spacer />

    <!-- The set batch labels menu. -->
    <v-menu offset-y>
      <template #activator="{ on }">
        <v-btn
          x-small
          class="view-header-button subtitle-2"
          v-on="on"
        >
          Set Batch Labels
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
          v-for="(entry, i) in classes"
          :key="i"
          style="min-height: 30px"
          @click="onClickSetBatchLabels(entry)"
        >
          <v-list-item-title
            height="20"
            class="subtitle-2 pa-0 ma-0"
            style="height: 20px"
          >
            {{ entry }}
            <v-icon
              class="pl-1"
              style="float: right"
              aria-hidden="true"
              small
              :style="`color: ${label2color(entry)}`"
            >
              $vuetify.icons.values.square
            </v-icon>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-card-title>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Label } from '@/commons/types';

export default Vue.extend({
  name: 'TheCardMatrixViewHeader',
  props: {
    classes: {
      type: Array,
      default: () => [],
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  methods: {
    onClickSetBatchLabels(label: Label): void {
      this.$emit('click-set-batch-labels', label);
    },
  },
});
</script>
