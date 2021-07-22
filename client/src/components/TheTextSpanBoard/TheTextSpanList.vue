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
        @click="$emit('select:span', labelSpan)"
      >
        <div style="display: flex">
          <div
            class="px-1"
            style="display: flex; align-items: center;
              font-size: 0.875rem; height: 20px;
              border: thin solid rgba(0,0,0,.12); border-radius: 2px;"
          >
            {{ labelSpan.category }}
            <v-icon
              class="pl-1"
              aria-hidden="true"
              small
              :style="{ color: label2color(labelSpan.category) }"
            >
              $vuetify.icons.values.square
            </v-icon>
          </div>
          <v-spacer />
          <v-btn
            title="remove"
            class="view-header-button elevation-0"
            :style="{ 'border-color': '#bbb' }"
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
