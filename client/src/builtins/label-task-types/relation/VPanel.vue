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
      Relations
    </div>
    <div style="overflow-y: scroll; flex: 1 1 auto;">
      <v-card
        v-for="labelRelation in labelRelations"
        :key="labelRelation.uuid"
        :ripple="false"
        class="rounded-0 elevation-0 pa-1"
        style="display: flex; flex-direction: row; font-size: 10px;"
        outlined
      >
        <!-- The source span on the left. -->
        <div
          class="pa-1"
          :style="{
            border: '1px solid',
            'border-color': isSpanSelected(getSpanByUuid(labelRelation.sourceUuid))
              ? 'gray' : '#eee',
            flex: '1 1 50%',
            cursor: 'pointer',
          }"
          @click="onSelectLabelSpan(getSpanByUuid(labelRelation.sourceUuid))"
        >
          <VLabelSpan
            :label-span="getSpanByUuid(labelRelation.sourceUuid)"
            :label2color="label2color"
          />
        </div>

        <v-icon
          class="px-1"
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.arrowRight
        </v-icon>

        <!-- The target span on the right. -->
        <div
          class="pa-1"
          :style="{
            border: '1px solid',
            'border-color': isSpanSelected(getSpanByUuid(labelRelation.targetUuid))
              ? 'gray' : '#eee',
            flex: '1 1 50%',
            cursor: 'pointer',
          }"
          @click="onSelectLabelSpan(getSpanByUuid(labelRelation.targetUuid))"
        >
          <VLabelSpan
            :label-span="getSpanByUuid(labelRelation.targetUuid)"
            :label2color="label2color"
          />
        </div>

        <!-- Delete relation button. -->
        <v-btn
          title="remove"
          class="view-header-button elevation-0 ml-1"
          style="border-color: #bbb"
          x-small
          icon
          outlined
          @click="$emit('remove:relation', labelRelation)"
        >
          <v-icon
            aria-hidden="true"
            small
          >
            $vuetify.icons.values.reset
          </v-icon>
        </v-btn>
      </v-card>
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
import VLabelSpan from './VLabelSpan.vue';

export default Vue.extend({
  name: 'VPanel',
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
    selectedSpan: {
      type: Object as PropType<ILabelTextSpan | null>,
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
    uuid2span(): Record<string, ILabelTextSpan> {
      const { labelSpans } = this;
      const uuid2span: Record<string, ILabelTextSpan> = {};
      if (labelSpans === null) return uuid2span;
      labelSpans.forEach((d: ILabelTextSpan) => {
        uuid2span[d.uuid] = d;
      });
      return uuid2span;
    },
  },
  methods: {
    onSelectLabelSpan(labelSpan: ILabelTextSpan): void {
      this.$emit('select:span', labelSpan);
    },
    getSpanByUuid(uuid: string): ILabelTextSpan | null {
      const { uuid2span } = this;
      return uuid in uuid2span ? uuid2span[uuid] : null;
    },
    isSpanSelected(labelSpan: ILabelTextSpan): boolean {
      const { selectedSpan } = this;
      if (selectedSpan === null) return false;
      return selectedSpan.uuid === labelSpan.uuid;
    },
  },
});
</script>
