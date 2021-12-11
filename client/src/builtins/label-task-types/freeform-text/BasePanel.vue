<template>
  <div
    :style="style.cardElevated"
    style="display: flex; flex-direction: column;"
  >
    <div :style="style.cardHeader">
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
        class="card-header-button subtitle-2"
        type="submit"
        @click="onSetLabelText"
      >
        submit
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { ILabel, ILabelText } from '@/commons/types';
import { cardElevated, cardHeader } from '@/style';

export default defineComponent({
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
  emits: {
    'upsert:labels': null,
  },
  data() {
    return {
      style: { cardElevated, cardHeader },
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
      this.$emit('upsert:labels', partialLabel);
    },
    syncLabel(): void {
      this.text = this.label?.text?.content ?? null;
    },
  },
});
</script>
