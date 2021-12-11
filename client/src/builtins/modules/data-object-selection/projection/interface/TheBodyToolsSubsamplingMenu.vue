<template>
  <v-menu
    offset-y
    :close-on-content-click="false"
  >
    <template #activator="{ on }">
      <v-btn
        title="Subsampling Configuration"
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
          $vuetify.icons.values.filter
        </v-icon>
      </v-btn>
    </template>
    <div class="card-elevated">
      <div class="card-header px-2">
        Subsampling Configuration
      </div>
      <v-divider />
      <div
        class="pa-2"
        style="display: flex; flex-direction: column; gap: 8px;"
      >
        <div style="display: flex; flex-direction: row; align-items: center;">
          <div style="flex: 1 1 100%">
            Enable Subsampling
          </div>
          <v-switch
            :value="enableSubsampling"
            :ripple="false"
            hide-details
            dense
            @change="onClickEnableSubsampling($event)"
          />
        </div>
        <div style="display: flex; flex-direction: row; align-items: center;">
          <div style="flex: 1 1 100%">
            #Samples
          </div>
          <v-text-field
            :value="subsamplingNSamples"
            :disabled="!enableSubsampling"
            :rules="[
              (x) =>
                x >= subsamplingNSamplesRange[0] &&
                x <= subsamplingNSamplesRange[1],
            ]"
            :min="subsamplingNSamplesRange[0]"
            :max="subsamplingNSamplesRange[1]"
            type="number"
            dense
            hide-details
            single-line
            @input="onInputSubsamplingNSamples(+$event)"
          />
        </div>
      </div>
    </div>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';

export default defineComponent({
  name: 'TheBodyToolsSubsamplingMenu',
  props: {
    enableSubsampling: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    subsamplingNSamples: {
      type: Number as PropType<number>,
      required: true,
    },
  },
  emits: {
    'update:subsampling': null,
  },
  data() {
    return {
      subsamplingNSamplesRange: [50, 500] as [number, number],
    };
  },
  methods: {
    onClickEnableSubsampling(enabled: (true | null)): void {
      const { subsamplingNSamples } = this;
      const subsamplingUpdated = {
        enabled: enabled === true,
        nSamples: subsamplingNSamples,
      };
      this.$emit('update:subsampling', subsamplingUpdated);
    },
    onInputSubsamplingNSamples(nSamples: number): void {
      const { enableSubsampling, subsamplingNSamplesRange } = this;
      if (nSamples < subsamplingNSamplesRange[0] || nSamples > subsamplingNSamplesRange[1]) {
        return;
      }
      const subsamplingUpdated = {
        enabled: enableSubsampling,
        nSamples,
      };
      this.$emit('update:subsampling', subsamplingUpdated);
    },
  },
});
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/main.sass';
.card {
  background-color: white;
  border: thin solid rgba(0,0,0,.12);
  border-radius: 4px;
}
.card-elevated {
  @extend .elevation-2;
  @extend .card;
}
</style>
