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
      Spans
    </div>
    <!-- A list of created spans. -->
    <div class="cards-container">
      <VLabelSpan
        v-for="labelSpan in labelSpans"
        :key="labelSpan.uuid"
        :span="labelSpan"
        :color="label2color(labelSpan.category)"
        :enable-link="enableLink"
        :is-selected="isSelected"
        :is-linking="isLinking"
        @select:span="onSelectSpan($event)"
        @remove:span="onRemoveSpan($event)"
        @link:span="onLinkSpan($event)"
      />
    </div>
  </v-card>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { LabelTaskType } from '@/commons/types';
import type {
  ILabel,
  ILabelRelation,
  ILabelTextSpan,
} from '@/commons/types';
import type { ToolbarState } from './types';
import VLabelSpan from './VLabelSpan.vue';

export default {
  name: 'BasePanel',
  components: { VLabelSpan },
  props: {
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    toolbarState: {
      type: Object as PropType<ToolbarState>,
      default: null,
    },
  },
  data() {
    return {
      sourceUuid: null as string | null,
    };
  },
  computed: {
    labelSpans(): ILabelTextSpan[] | null {
      return this.label?.spans ?? null;
    },
    labelRelations(): ILabelRelation[] | null {
      return this.label?.relations ?? null;
    },
    enableLink(): boolean {
      return this.labelTasks.includes(LabelTaskType.AnnotationRelation);
    },
    selectedSpan(): ILabelTextSpan | null {
      return this.toolbarState?.selectedSpan ?? null;
    },
  },
  methods: {
    onLinkSpan(span: ILabelTextSpan): void {
      if (this.sourceUuid === null) {
        this.sourceUuid = span.uuid;
        return;
      }
      const relation: ILabelRelation = {
        sourceUuid: this.sourceUuid,
        targetUuid: span.uuid,
        uuid: uuidv4(),
      };
      const relations = [...(this.labelRelations ?? []), relation];
      this.$emit('upsert:label', { relations } as Partial<ILabel>);
      this.sourceUuid = null;
    },
    onRemoveSpan(span: ILabelTextSpan): void {
      const { labelSpans, labelRelations } = this;
      if (labelSpans === null) return;

      // Remove the relations that involves the label span.
      const relations = labelRelations?.filter((d) => (
        d.sourceUuid !== span.uuid && d.targetUuid !== span.uuid
      ));

      // Remove the label span itself.
      const spans = labelSpans.filter((d) => d.uuid !== span.uuid);

      this.$emit('upsert:label', { relations, spans } as Partial<ILabel>);
    },
    onSelectSpan(span: ILabelTextSpan): void {
      const partial: Partial<ToolbarState> = {
        strokeCategory: span.category,
        selectedSpan: span,
      };
      this.$emit('upsert:toolbar-state', partial);
    },
    isSelected(labelSpan: ILabelTextSpan): boolean {
      const { selectedSpan } = this;
      return selectedSpan !== null && selectedSpan.uuid === labelSpan.uuid;
    },
    isLinking(span: ILabelTextSpan): boolean {
      const { sourceUuid } = this;
      return sourceUuid !== null && sourceUuid === span.uuid;
    },
  },
};
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
