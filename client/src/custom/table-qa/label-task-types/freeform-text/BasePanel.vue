<template>
  <div
    class="card-elevated"
    style="display: flex; flex-direction: column;"
  >
    <div class="card-header">
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
import type { ILabelText } from '@/commons/types';
import type { ILabel } from '../../types';

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
      const textContent = this.label?.text?.content ?? null;
      if (textContent !== null) {
        this.text = textContent;
        return;
      }
      const queries = this.label?.queries ?? [];
      if (queries.length !== 1) return;
      this.text = queries[0].text;
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
