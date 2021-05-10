<template>
  <v-card
    style="overflow: hidden"
    :ripple="false"
    @mouseenter="onHoverCard(dataObject)"
    @mouseleave="onLeaveCard(dataObject)"
  >
    <!-- set pointer events none so that
      hover the child will not trigger mouse out of the parent -->
    <VDataObjectCardHeader
      class="px-1 py-0 white--text"
      pointer-events="none"
      :label="label"
      :classes="classes"
      :title="title"
      :button-color="buttonColor"
      :style="{
        'height': `${headerHeight}px`
      }"
      @click:label="onClickCardLabel"
    />
    <v-card-actions
      class="pa-0"
      pointer-events="none"
    >
      <component
        :is="component"
        :data-object="dataObject"
        :height="bodyHeight"
        :width="bodyWidth"
      />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
/**
 * The wrapped component for rendering an dataObject
 * as a cell in a card.
 * This component have access to the global state.
 */

import Vue, { PropType, VueConstructor } from 'vue';
import {
  DataType,
  IDataObject,
  Label,
} from '@/commons/types';
import VDataObjectCardHeader from './VDataObjectCardHeader.vue';
import VDisplayImage from './VDisplayImage.vue';
import VDisplayText from './VDisplayText.vue';

export default Vue.extend({
  name: 'VDataObjectCard',
  components: {
    VDataObjectCardHeader,
    VDisplayImage,
    VDisplayText,
  },
  props: {
    dataType: {
      type: String as PropType<DataType>,
      required: true,
    },
    dataObject: {
      type: Object as PropType<IDataObject>,
      required: true,
    },
    label: {
      type: [String, Number, Boolean] as PropType<Label>,
      required: true,
    },
    classes: {
      type: Array as PropType<Label[]>,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    buttonColor: {
      type: String as PropType<string | null>,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    width: {
      type: Number,
      default: null,
    },
    headerHeight: {
      type: Number,
      default: 29,
    },
  },
  computed: {
    component(): VueConstructor | null {
      const { dataType } = this;
      const mapper = {
        [DataType.Image]: VDisplayImage,
        [DataType.Text]: VDisplayText,
      } as Partial<Record<DataType, VueConstructor>>;
      if (dataType !== null && dataType in mapper) return mapper[dataType];
      return null;
    },
    bodyHeight(): number {
      return Math.max(this.height - this.headerHeight, 0);
    },
    bodyWidth(): number {
      return this.width;
    },
  },
  methods: {
    onClickCardLabel(label: Label): void {
      const { dataObject } = this;
      this.$emit('click:card-label', dataObject, label);
    },
    onHoverCard(dataObject: IDataObject): void {
      this.$emit('hover:card', dataObject);
    },
    onLeaveCard(dataObject: IDataObject): void {
      this.$emit('leave:card', dataObject);
    },
  },
});
</script>
