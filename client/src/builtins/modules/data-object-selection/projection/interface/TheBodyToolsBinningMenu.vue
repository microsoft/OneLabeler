<template>
  <v-menu
    offset-y
    :close-on-content-click="false"
  >
    <template #activator="{ on }">
      <v-btn
        title="Binning Configuration"
        :elevation="0"
        x-small
        icon
        tile
        v-on="on"
      >
        <v-icon
          aria-hidden="true"
          color="black"
          small
        >
          $vuetify.icons.values.matrix
        </v-icon>
      </v-btn>
    </template>
    <div :style="style.cardElevated">
      <div
        :style="style.cardHeader"
        class="px-2"
      >
        Binning Configuration
      </div>
      <div
        class="pa-2"
        style="display: flex; flex-direction: column; gap: 8px;"
      >
        <div style="display: flex; flex-direction: row; align-items: center;">
          <div style="flex: 1 1 100%">
            Enable Binning
          </div>
          <v-switch
            :value="enableBinning"
            :ripple="false"
            hide-details
            dense
            @change="onClickEnableBinning($event)"
          />
        </div>
        <div style="display: flex; flex-direction: row; align-items: center;">
          <div style="flex: 1 1 100%">
            #Rows
          </div>
          <v-text-field
            :value="binningNRows"
            :disabled="!enableBinning"
            :rules="[
              (x) =>
                x >= binningNRowsRange[0] &&
                x <= binningNRowsRange[1],
            ]"
            :min="binningNRowsRange[0]"
            :max="binningNRowsRange[1]"
            type="number"
            dense
            hide-details
            single-line
            @input="onInputBinningNRows(+$event)"
          />
        </div>
        <div style="display: flex; flex-direction: row; align-items: center;">
          <div style="flex: 1 1 100%">
            #Columns
          </div>
          <v-text-field
            :value="binningNColumns"
            :disabled="!enableBinning"
            :rules="[
              (x) =>
                x >= binningNColumnsRange[0] &&
                x <= binningNColumnsRange[1],
            ]"
            :min="binningNColumnsRange[0]"
            :max="binningNColumnsRange[1]"
            dense
            hide-details
            single-line
            type="number"
            @input="onInputBinningNColumns(+$event)"
          />
        </div>
      </div>
    </div>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { cardElevated, cardHeader } from '@/style';

type BinningConfig = {
  enabled: boolean;
  nRows: number;
  nColumns: number;
}

export default defineComponent({
  name: 'TheBodyToolsBinningMenu',
  props: {
    enableBinning: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    binningNRows: {
      type: Number as PropType<number>,
      required: true,
    },
    binningNColumns: {
      type: Number as PropType<number>,
      required: true,
    },
  },
  emits: {
    'update:binning': null,
  },
  data() {
    return {
      style: { cardElevated, cardHeader },
      binningNRowsRange: [5, 50] as [number, number],
      binningNColumnsRange: [5, 50] as [number, number],
    };
  },
  methods: {
    onClickEnableBinning(enabled: (true | null)): void {
      const { binningNRows, binningNColumns } = this;
      const binningUpdated: BinningConfig = {
        enabled: enabled === true,
        nRows: binningNRows,
        nColumns: binningNColumns,
      };
      this.$emit('update:binning', binningUpdated);
    },
    onInputBinningNRows(nRows: number): void {
      const { binningNRowsRange, enableBinning, binningNColumns } = this;
      if (nRows < binningNRowsRange[0] || nRows > binningNRowsRange[1]) {
        return;
      }
      const binningUpdated: BinningConfig = {
        enabled: enableBinning,
        nRows,
        nColumns: binningNColumns,
      };
      this.$emit('update:binning', binningUpdated);
    },
    onInputBinningNColumns(nColumns: number): void {
      const { binningNColumnsRange, enableBinning, binningNRows } = this;
      if (nColumns < binningNColumnsRange[0] || nColumns > binningNColumnsRange[1]) {
        return;
      }
      const binningUpdated: BinningConfig = {
        enabled: enableBinning,
        nRows: binningNRows,
        nColumns,
      };
      this.$emit('update:binning', binningUpdated);
    },
  },
});
</script>
