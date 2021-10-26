<template>
  <!-- A list of created spans. -->
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
    <div class="cards-container">
      <v-card
        v-for="labelSpan in labelSpans"
        :key="labelSpan.uuid"
        :style="{ 'border-color': isSelected(labelSpan) ? 'gray' : undefined }"
        :ripple="false"
        class="rounded-0 elevation-0 pa-1"
        outlined
        @click="$emit('select:span', labelSpan)"
      >
        <div style="display: flex">
          <div
            class="px-1"
            style="display: flex; align-items: center;
              font-size: 0.875rem; height: 20px;
              border: thin solid rgba(0,0,0,.12); border-radius: 2px;"
          >
            <v-icon
              class="pr-1"
              aria-hidden="true"
              small
              :style="{ color: label2color(labelSpan.category) }"
            >
              $vuetify.icons.values.square
            </v-icon>
            {{ labelSpan.category }}
          </div>
          <v-spacer />
          <v-btn
            title="remove"
            class="view-header-button elevation-0"
            style="border-color: #bbb"
            x-small
            icon
            outlined
            @click.stop="$emit('remove:span', labelSpan)"
          >
            <v-icon
              aria-hidden="true"
              small
            >
              $vuetify.icons.values.reset
            </v-icon>
          </v-btn>
          <v-btn
            v-if="includesAnnotationRelation"
            title="link"
            class="view-header-button elevation-0"
            :style="{
              'border-color': '#bbb',
              'background-color': sourceUuid === labelSpan.uuid ? '#bbb' : undefined,
            }"
            x-small
            icon
            outlined
            @click.stop="onCreateLabelRelation(labelSpan)"
          >
            <v-icon
              aria-hidden="true"
              small
            >
              $vuetify.icons.values.link
            </v-icon>
          </v-btn>
        </div>
        <div class="mx-1">
          {{ labelSpan.text }}
        </div>
      </v-card>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import {
  ILabel,
  ILabelRelation,
  ILabelTextSpan,
  LabelTaskType,
} from '@/commons/types';

export default Vue.extend({
  name: 'VPanel',
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
    selectedSpan: {
      type: Object as PropType<ILabelTextSpan | null>,
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
    includesAnnotationRelation(): boolean {
      return this.labelTasks.includes(LabelTaskType.AnnotationRelation);
    },
  },
  methods: {
    onCreateLabelRelation(labelSpan: ILabelTextSpan): void {
      if (this.sourceUuid === null) {
        this.sourceUuid = labelSpan.uuid;
      } else {
        const relation: ILabelRelation = {
          sourceUuid: this.sourceUuid,
          targetUuid: labelSpan.uuid,
          uuid: uuidv4(),
        };
        this.$emit('create:relation', relation);
        this.sourceUuid = null;
      }
    },
    isSelected(labelSpan: ILabelTextSpan): boolean {
      const { selectedSpan } = this;
      if (selectedSpan === null) return false;
      return selectedSpan.uuid === labelSpan.uuid;
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
}
</style>
