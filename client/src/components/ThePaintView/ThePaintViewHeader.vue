<template>
  <v-card-title class="view-header">
    <v-icon
      class="px-2"
      aria-hidden="true"
      small
    >
      $vuetify.icons.values.image
    </v-icon>
    Sampled Object
    <v-spacer />

    <!-- mouse operation mode toggle -->
    <v-btn-toggle
      :value="mouseOperationIndex"
      class="view-header-button-toggle"
      mandatory
      @change="onSetMouseOperation($event)"
    >
      <v-btn
        v-for="btn in mouseOperationButtons"
        :key="btn.mouseOperation"
        :title="btn.title"
        class="px-1"
        icon
        x-small
      >
        <v-icon
          aria-hidden="true"
          small
        >
          {{ btn.icon }}
        </v-icon>
      </v-btn>
    </v-btn-toggle>

    <v-divider
      class="mx-2"
      vertical
    />

    <!-- stroke shape menu -->
    <v-menu offset-y>
      <template #activator="{ on }">
        <v-btn
          class="view-header-button subtitle-2"
          title="Set Stroke Shape"
          x-small
          v-on="on"
        >
          Brush
          <v-icon
            class="pl-1"
            style="width: 20px"
            aria-hidden="true"
            small
          >
            {{ strokeShapeMenu.optionsIcon[strokeShapeIndex] }}
          </v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
          v-for="(option, i) in strokeShapeMenu.options"
          :key="i"
          class="list-group-item d-flex justify-content-between align-items-center py-0 px-2"
          @click="onSetStrokeShape(option)"
        >
          <v-list-item-title
            class="subtitle-2"
            style="height: 20px"
          >
            {{ strokeShapeMenu.optionsText[i] }}
            <v-icon
              style="float: right"
              aria-hidden="true"
              small
            >
              {{ strokeShapeMenu.optionsIcon[i] }}
            </v-icon>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-divider
      class="mx-2"
      vertical
    />

    <!-- stroke width menu -->
    <v-menu offset-y>
      <template #activator="{ on }">
        <v-btn
          class="view-header-button subtitle-2"
          x-small
          v-on="on"
        >
          Size
          <v-container class="pl-1 pr-0 py-0">
            <svg
              width="30px"
              height="23.2px"
            >
              <rect
                :y="13.1 - strokeWidth/2"
                :height="strokeWidth"
                width="30"
                fill="black"
              />
            </svg>
          </v-container>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
          v-for="(entry, i) in strokeWidthMenu.options"
          :key="i"
          class="list-group-item d-flex justify-content-between align-items-center py-0 px-2"
          @click="onSetStrokeWidth(entry)"
        >
          <v-list-item-title
            style="height: 20px"
          >
            <svg
              width="60px"
              height="18px"
            >
              <rect
                :y="9 - strokeWidthMenu.options[i]/2"
                :height="strokeWidthMenu.options[i]"
                width="60"
                fill="black"
              />
            </svg>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-divider
      class="mx-2"
      vertical
    />

    <!-- stroke color menu -->
    <v-menu
      v-if="strokeLabel !== null"
      offset-y
    >
      <template #activator="{ on }">
        <v-btn
          x-small
          width="85"
          class="view-header-button subtitle-2 pl-1"
          v-on="on"
        >
          {{ strokeLabelMenu[strokeLabelIndex].label === unlabeledMark ?
            'erase' : `${strokeLabelMenu[strokeLabelIndex].label}` }}
          <v-spacer />
          <v-icon
            aria-hidden="true"
            small
            :style="`color: ${strokeLabelMenu[strokeLabelIndex].color}`"
          >
            $vuetify.icons.values.square
          </v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
          v-for="option in strokeLabelMenu"
          :key="option.label"
          @click="onSetStrokeLabel(option.label)"
        >
          <v-list-item-title
            class="subtitle-2"
            style="height: 20px"
          >
            {{ option.label === unlabeledMark ? 'erase' : `${option.label}` }}
            <v-icon
              class="pl-1"
              style="float: right"
              aria-hidden="true"
              small
              :style="`color: ${option.color}`"
            >
              $vuetify.icons.values.square
            </v-icon>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-card-title>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Label } from '@/commons/types';
import { MouseOperationType, StrokeShapeType } from './types';

export default Vue.extend({
  name: 'ThePaintViewHeader',
  props: {
    strokeLabel: {
      type: String as PropType<Label | null>,
      default: null,
    },
    strokeShape: {
      type: String as PropType<StrokeShapeType>,
      required: true,
    },
    strokeWidth: {
      type: Number as PropType<number>,
      required: true,
    },
    mouseOperation: {
      type: String as PropType<MouseOperationType>,
      required: true,
    },
    classes: {
      type: Array as PropType<Label[]>,
      required: true,
    },
    unlabeledMark: {
      type: String as PropType<Label>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  data() {
    return {
      mouseOperationIndexModel: 0,
      strokeWidthMenu: {
        options: [1, 5, 15],
        optionsText: ['1', '5', '15'],
      },
      strokeShapeMenu: {
        options: [StrokeShapeType.Circle, StrokeShapeType.Square],
        optionsText: ['Circle', 'Square'],
        optionsIcon: [this.$vuetify.icons.values.circle, this.$vuetify.icons.values.square],
      },
      mouseOperationButtons: [
        {
          title: 'pan & zoom',
          icon: this.$vuetify.icons.values.zoom,
          mouseOperation: MouseOperationType.PanAndZoom,
        },
        {
          title: 'paint',
          icon: this.$vuetify.icons.values.paint,
          mouseOperation: MouseOperationType.PaintBrush,
        },
      ],
    };
  },
  computed: {
    mouseOperationIndex(): number {
      const { mouseOperation, mouseOperationButtons } = this;
      const index = mouseOperationButtons.findIndex((d) => d.mouseOperation === mouseOperation);
      return index;
    },
    strokeShapeIndex(): number {
      const { strokeShape, strokeShapeMenu } = this;
      const index = strokeShapeMenu.options.findIndex((d) => d === strokeShape);
      return index;
    },
    strokeLabelIndex(): number {
      const { strokeLabel, strokeLabelMenu } = this;
      const index = strokeLabelMenu.findIndex((d) => d.label === strokeLabel);
      return index;
    },
    strokeLabelMenu() {
      const { classes, unlabeledMark, label2color } = this;
      return [unlabeledMark, ...classes].map((d: Label) => ({
        label: d,
        color: label2color(d),
      }));
    },
  },
  methods: {
    onSetMouseOperation(index: number) {
      const { mouseOperation } = this.mouseOperationButtons[index];
      this.$emit('set-mouse-operation', mouseOperation);
    },
    onSetStrokeShape(strokeShape: StrokeShapeType) {
      this.$emit('set-stroke-shape', strokeShape);
    },
    onSetStrokeWidth(strokeWidth: number) {
      this.$emit('set-stroke-width', strokeWidth);
    },
    onSetStrokeLabel(strokeLabel: Label) {
      this.$emit('set-stroke-label', strokeLabel);
    },
  },
});
</script>
