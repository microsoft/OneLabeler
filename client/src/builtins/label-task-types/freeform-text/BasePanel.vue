<template>
  <v-card style="display: flex; flex-direction: column;">
    <div class="view-header">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.info
      </v-icon>
      Freeform Text
    </div>
    <div
      class="pa-1"
      style="overflow-y: scroll; flex: 1 1 auto; display: flex; flex-direction: column;"
    >
      <v-textarea
        v-model="text"
        label="Annotation"
        auto-grow
        no-resize
      />
      <v-btn
        x-small
        class="view-header-button subtitle-2"
        type="submit"
        @click="onSetLabelText"
      >
        submit
      </v-btn>
    </div>
  </v-card>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { ILabel, ILabelText } from '@/commons/types';

export default {
  name: 'BasePanel',
  props: {
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      text: null as string | null,
    };
  },
  watch: {
    label() {
      this.syncLabel();
    },
  },
  mounted() {
    this.syncLabel();
  },
  methods: {
    onSetLabelText(): void {
      const text: ILabelText = { content: this.text };
      const partialLabel: Partial<ILabel> = { text };
      this.syncLabel();
      this.$emit('upsert:label', partialLabel);
    },
    syncLabel(): void {
      this.text = this.label?.text?.content ?? null;
    },
  },
};
</script>
