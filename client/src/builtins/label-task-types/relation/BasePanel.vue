<template>
  <v-card style="display: flex; flex-direction: column">
    <div class="view-header">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.info
      </v-icon>
      Relations
    </div>
    <div class="cards-container">
      <VLabelRelation
        v-for="relation in labelRelations"
        :key="relation.uuid"
        :relation="relation"
        :source="getSpanByUuid(relation.sourceUuid)"
        :target="getSpanByUuid(relation.targetUuid)"
        :label2color="label2color"
        :is-selected="isSelected"
        @select:span="$emit('upsert:toolbar-state', { selectedSpan: $event })"
        @remove:relation="onRemoveLabelRelation($event)"
      />
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  ILabel,
  ILabelRelation,
  ILabelTextSpan,
} from '@/commons/types';
import VLabelRelation from './VLabelRelation.vue';
import { ToolbarState } from './types';

export default Vue.extend({
  name: 'BasePanel',
  components: { VLabelRelation },
  props: {
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    toolbarState: {
      type: Object as PropType<ToolbarState>,
      default: null,
    },
  },
  computed: {
    labelSpans(): ILabelTextSpan[] | null {
      return this.label?.spans ?? null;
    },
    labelRelations(): ILabelRelation[] | null {
      return this.label?.relations ?? null;
    },
    selectedSpan(): ILabelTextSpan | null {
      return this.toolbarState?.selectedSpan ?? null;
    },
    uuid2span(): Record<string, ILabelTextSpan> {
      const { labelSpans } = this;
      if (labelSpans === null) return {};
      return Object.fromEntries(labelSpans.map((d) => [d.uuid, d]));
    },
  },
  methods: {
    onRemoveLabelRelation(relation: ILabelRelation): void {
      const { labelRelations } = this;
      if (labelRelations === null) return;
      const relations = labelRelations.filter((d) => d.uuid !== relation.uuid);
      this.$emit('upsert:label', { relations } as Partial<ILabel>);
    },
    getSpanByUuid(uuid: string): ILabelTextSpan | null {
      return this.uuid2span[uuid] ?? null;
    },
    isSelected(span: ILabelTextSpan): boolean {
      return span.uuid === this.selectedSpan?.uuid;
    },
  },
});
</script>

<style lang="scss" scoped>
.cards-container {
  $margin: 4px;
  display: flex;
  flex-direction: column;
  gap: $margin;
  padding: $margin;
  overflow-y: auto;
  flex: 1 1 auto;
}
</style>