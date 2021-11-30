<template>
  <!-- The data object label menu. -->
  <v-menu
    v-model="showMenu"
    :close-on-click="false"
    offset-y
  >
    <template #activator="{ on }">
      <v-btn
        :disabled="disabled"
        class="view-header-button subtitle-2 text-none"
        x-small
        v-on="on"
      >
        Selected Queries
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="(query, i) in queries"
        :key="i"
        class="subtitle-2 pr-4 pl-2"
        style="min-height: 30px"
        @click.stop="onClickQuery(query)"
      >
        <v-checkbox
          :value="isQuerySelected(query)"
          :input-value="isQuerySelected(query)"
          class="py-0 ma-0"
          dense
          hide-details
        />
        {{ getQueryText(query) }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';

type Query = {
  text: string;
  // eslint-disable-next-line camelcase
  back_text: string;
  // eslint-disable-next-line camelcase
  related_attr: string[];
  type: string;
}

export default defineComponent({
  name: 'VQueryMenu',
  props: {
    labelQueries: {
      type: Array as PropType<Query[] | null>,
      default: null,
    },
    queries: {
      type: Array as PropType<Query[]>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    multiSelect: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'set:label-queries': null,
  },
  data() {
    return { showMenu: true };
  },
  watch: {
    queries() {
      this.showMenu = true;
    },
  },
  methods: {
    onClickQuery(query: Query): void {
      if (!this.multiSelect) {
        this.$emit('set:label-queries', [query]);
        return;
      }

      const { labelQueries } = this;
      if (labelQueries === null) {
        this.$emit('set:label-queries', [query]);
        return;
      }
      const idx = labelQueries.findIndex((d) => d.text === query.text);
      const newValue: Query[] = idx >= 0
        ? [...labelQueries.slice(0, idx), ...labelQueries.slice(idx + 1)]
        : [...labelQueries, query];
      this.$emit('set:label-queries', newValue);
    },
    isQuerySelected(query: Query): boolean {
      const { labelQueries } = this;
      if (labelQueries === null) return false;
      const idx = labelQueries.findIndex((d) => d.text === query.text);
      return idx >= 0;
    },
    getQueryText(query: Query): string {
      return query.back_text ?? query.text;
    },
  },
});
</script>
