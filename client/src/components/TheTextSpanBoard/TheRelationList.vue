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
        <div
          class="pa-1"
          style="border: 1px solid #eee; flex: 1 1 50%;"
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
        <div
          class="pa-1"
          style="border: 1px solid #eee; flex: 1 1 50%;"
        >
          <VLabelSpan
            :label-span="getSpanByUuid(labelRelation.targetUuid)"
            :label2color="label2color"
          />
        </div>
        <v-btn
          title="remove"
          class="view-header-button elevation-0 ml-1"
          style="border-color: #bbb"
          x-small
          icon
          outlined
          @click="onRemoveLabelRelation(labelRelation)"
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
  ILabelRelation,
  ILabelTextSpan,
} from '@/commons/types';
import VLabelSpan from './VLabelSpan.vue';

export default Vue.extend({
  name: 'TheTextSpanList',
  components: { VLabelSpan },
  props: {
    labelRelations: {
      type: Array as PropType<ILabelRelation[] | null>,
      default: null,
    },
    labelSpans: {
      type: Array as PropType<ILabelTextSpan[] | null>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  methods: {
    getSpanByUuid(uuid: string): ILabelTextSpan | null {
      const { labelSpans } = this;
      if (labelSpans === null) return null;
      const find = labelSpans.find((d) => d.uuid === uuid);
      if (find === undefined) return null;
      return find;
    },
    onRemoveLabelRelation(labelRelation: ILabelRelation): void {
      this.$emit('remove:relation', labelRelation);
    },
  },
});
</script>
