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
    <div style="overflow-y: scroll">
      <v-card
        v-for="labelSpan in labelSpans"
        :key="labelSpan.uuid"
        :style="{ 'border-color': isSelected(labelSpan) ? 'gray' : undefined }"
        :ripple="false"
        class="rounded-0 elevation-0 pa-2"
        outlined
        @click="onSelectLabelSpan(labelSpan)"
      >
        <div style="display: flex">
          <v-btn
            class="view-header-button subtitle-2 mr-1 elevation-0 text-none"
            :style="{ 'border-color': '#bbb' }"
            x-small
            outlined
          >
            {{ labelSpan.category }}
            <v-icon
              class="pl-2"
              aria-hidden="true"
              small
              :style="{ color: label2color(labelSpan.category) }"
            >
              $vuetify.icons.values.square
            </v-icon>
          </v-btn>
          <v-spacer />
          <v-btn
            title="remove"
            class="view-header-button elevation-0"
            :style="{ 'border-color': '#bbb' }"
            x-small
            icon
            outlined
            @click.stop="onRemoveLabelSpan(labelSpan)"
          >
            <v-icon
              aria-hidden="true"
              small
            >
              $vuetify.icons.values.reset
            </v-icon>
          </v-btn>
          <v-btn
            v-if="enableAnnotationRelation"
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
  ILabelRelation,
  ILabelTextSpan,
  LabelTaskType,
} from '@/commons/types';

export default Vue.extend({
  name: 'TheTextSpanList',
  props: {
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    labelSpans: {
      type: Array as PropType<ILabelTextSpan[] | null>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
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
    enableAnnotationRelation(): boolean {
      return this.labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.AnnotationRelation,
      ) >= 0;
    },
  },
  methods: {
    onRemoveLabelSpan(labelSpan: ILabelTextSpan): void {
      this.$emit('remove:span', labelSpan);
    },
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
    onSelectLabelSpan(labelSpan: ILabelTextSpan): void {
      this.$emit('select:span', labelSpan);
    },
    isSelected(labelSpan: ILabelTextSpan): boolean {
      const { selectedSpan } = this;
      if (selectedSpan === null) return false;
      return selectedSpan.uuid === labelSpan.uuid;
    },
  },
});
</script>
