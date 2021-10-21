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
        Selected Columns
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="(column, i) in columns"
        :key="i"
        class="subtitle-2 pr-4 pl-2"
        style="min-height: 30px"
        @click.stop="onClickColumn(column)"
      >
        <v-checkbox
          :value="isColumnSelected(column)"
          :input-value="isColumnSelected(column)"
          class="py-0 ma-0"
          dense
          hide-details
        />
        {{ column }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
  name: 'VColumnMenu',
  props: {
    labelColumns: {
      type: Array as PropType<string[] | null>,
      default: null,
    },
    columns: {
      type: Array as PropType<string[]>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return { showMenu: true };
  },
  watch: {
    columns() {
      this.showMenu = true;
    },
  },
  methods: {
    onClickColumn(column: string): void {
      const { labelColumns } = this;
      if (labelColumns === null) {
        this.$emit('set:label-columns', [column]);
        return;
      }
      const idx = labelColumns.findIndex((d) => d === column);
      const newValue: string[] = idx >= 0
        ? [...labelColumns.slice(0, idx), ...labelColumns.slice(idx + 1)]
        : [...labelColumns, column];
      this.$emit('set:label-columns', newValue);
    },
    isColumnSelected(column: string): boolean {
      return this.labelColumns?.includes(column) ?? false;
    },
  },
});
</script>
