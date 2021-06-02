<template>
  <div
    class="subtitle-1 grey darken-1"
    style="display: flex; align-items: center; user-select: none;"
  >
    {{ title }}
    <v-icon
      v-if="isLabeled"
      class="px-2"
      color="white"
      aria-hidden="true"
      style="font-size:12px; width: 1.5rem;"
      small
    >
      $vuetify.icons.values.verified
    </v-icon>

    <div style="flex-grow: 1" />

    <!-- The data object label menu. -->
    <v-menu
      v-if="label !== undefined"
      offset-y
    >
      <template #activator="{ on }">
        <v-btn
          :color="buttonColor === null ? '' : buttonColor"
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
          class="subtitle-2 px-4"
          style="min-height: 30px"
          @click="onClickLabel(entry)"
        >
          {{ entry }}
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Category,
  ILabelCategory,
  StatusType,
} from '@/commons/types';

export default Vue.extend({
  name: 'VDataObjectCardHeader',
  props: {
    label: {
      type: String as PropType<ILabelCategory | undefined>,
      default: undefined,
      required: false,
    },
    status: {
      type: String as PropType<StatusType>,
      required: true,
    },
    classes: {
      type: Array as PropType<Category[]>,
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
  computed: {
    isLabeled(): boolean {
      return this.status === StatusType.Labeled;
    },
  },
  methods: {
    onClickLabel(entry: ILabelCategory, e: Event): void {
      this.$emit('click:label', entry, e);
    },
  },
});
</script>
