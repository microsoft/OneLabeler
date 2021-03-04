<template>
  <v-card-title
    class="subtitle-1 grey darken-1"
    style="user-select: none;"
  >
    {{ title }}
    <v-spacer />

    <!-- The data object label menu. -->
    <v-menu offset-y>
      <template #activator="{ on }">
        <v-btn
          :color="buttonColor === null ? '' : buttonColor "
          class="view-header-button subtitle-2"
          x-small
          v-on="on"
        >
          {{ label }}
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
          v-for="(entry, i) in classes"
          :key="i"
          style="min-height: 30px"
          @click="onClickLabel(entry)"
        >
          <v-list-item-title
            height="20"
            class="subtitle-2 pa-0 ma-0"
            style="height: 20px"
          >
            {{ entry }}
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
  name: 'VDataObjectCardHeader',
  props: {
    label: {
      type: [String, Number, Boolean] as PropType<Label>,
      required: true,
    },
    classes: {
      type: Array as PropType<Label[]>,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    buttonColor: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  methods: {
    onClickLabel(entry: Label, e: Event): void {
      this.$emit('click-label', entry, e);
    },
  },
});
</script>
