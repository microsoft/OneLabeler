<template>
  <v-card-title
    class="subtitle-1 grey darken-1"
    style="user-select: none;"
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
import {
  Category,
  ILabelCategory,
  Status,
} from '@/commons/types';

export default Vue.extend({
  name: 'VDataObjectCardHeader',
  props: {
    label: {
      type: String as PropType<ILabelCategory>,
      required: true,
    },
    status: {
      type: String as PropType<Status>,
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
      return this.status === Status.Labeled;
    },
  },
  methods: {
    onClickLabel(entry: ILabelCategory, e: Event): void {
      this.$emit('click:label', entry, e);
    },
  },
});
</script>
