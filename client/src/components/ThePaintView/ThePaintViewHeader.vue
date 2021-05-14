<template>
  <VToolbar
    @window:minimize="onClickMinimize"
    @window:pin="onClickPin"
  >
    <template #title>
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.image
      </v-icon>
      Image
    </template>
    <template #tools>
      <!-- The set batch labels menu. -->
      <!-- reset image size button -->
      <v-btn
        title="reset image size"
        class="view-header-button ml-2"
        x-small
        icon
        @click="onResetImageSize"
      >
        <v-icon
          aria-hidden="true"
          class="px-0"
          small
        >
          $vuetify.icons.values.expand
        </v-icon>
      </v-btn>

      <v-divider
        class="mx-2"
        vertical
      />

      <!-- mouse operation mode toggle -->
      <v-btn-toggle
        :value="mouseOperationIndex"
        :mandatory="objectShapeIndex === null"
        class="view-header-button-toggle"
      >
        <v-btn
          v-for="btn in (enableImageSegmentation
            ? mouseOperationButtons : mouseOperationButtons.slice(0, 1))"
          :key="btn.mouseOperation"
          :title="btn.title"
          :disabled="btn.disabled"
          class="px-1"
          icon
          x-small
          @click="onSetMouseOperation(btn.mouseOperation)"
        >
          <v-icon
            aria-hidden="true"
            small
          >
            {{ btn.icon }}
          </v-icon>
        </v-btn>
      </v-btn-toggle>

      <template v-if="enableObjectDetection">
        <v-divider
          class="mx-2"
          vertical
        />

        <!-- object shape toggle -->
        <v-btn-toggle
          :value="objectShapeIndex"
          :mandatory="mouseOperationIndex === null"
          class="view-header-button-toggle"
        >
          <v-btn
            v-for="btn in objectShapeButtons"
            :key="btn.mouseOperation"
            :title="btn.title"
            :disabled="btn.disabled"
            class="px-1"
            icon
            x-small
            @click="onSetMouseOperation(btn.mouseOperation)"
          >
            <v-icon
              v-if="btn.icon === $vuetify.icons.values.drawPolygon"
              aria-hidden="true"
              small
            >
              $vuetify.icons.values.drawPolygon
            </v-icon>
            <v-icon
              v-else-if="btn.icon === $vuetify.icons.values.drawSquare"
              aria-hidden="true"
              small
            >
              $vuetify.icons.values.drawSquare
            </v-icon>
            <v-icon
              v-else-if="btn.icon === $vuetify.icons.values.drawCircle"
              aria-hidden="true"
              small
            >
              $vuetify.icons.values.drawCircle
            </v-icon>
            <v-icon
              v-else-if="btn.icon === $vuetify.icons.values.pen"
              aria-hidden="true"
              small
            >
              $vuetify.icons.values.pen
            </v-icon>
          </v-btn>
        </v-btn-toggle>
      </template>

      <template v-if="enableImageSegmentation">
        <v-divider
          class="mx-2"
          vertical
        />

        <!-- stroke shape menu -->
        <v-menu offset-y>
          <template #activator="{ on }">
            <v-btn
              :disabled="mouseOperation !== MouseOperationType.PaintBrush
                && mouseOperation !== MouseOperationType.PaintErase"
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
              :disabled="mouseOperation !== MouseOperationType.PaintBrush
                && mouseOperation !== MouseOperationType.PaintErase"
              class="view-header-button subtitle-2"
              title="Set Stroke Width"
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
                    :fill="(mouseOperation === MouseOperationType.PaintBrush
                      || mouseOperation === MouseOperationType.PaintErase)
                      ? 'black' : 'rgba(0,0,0,.26)'"
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
      </template>

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
            :disabled="mouseOperation === MouseOperationType.PanAndZoom
              || mouseOperation === MouseOperationType.EditGeometricObject
              || mouseOperation === MouseOperationType.PaintErase"
            width="85"
            class="view-header-button subtitle-2 pl-1 text-none"
            title="Set Stroke Color"
            x-small
            v-on="on"
          >
            {{ `${strokeLabelMenu.length !== 0
              ? strokeLabelMenu[strokeLabelIndex].label : ''}` }}
            <v-spacer />
            <v-icon
              v-if="strokeLabelMenu.length !== 0"
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
              {{ `${option.label}` }}
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
      <v-btn
        v-else
        class="view-header-button"
        width="85"
        title="Set Stroke Color"
        x-small
        disabled
        icon
      />
    </template>
  </VToolbar>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Label, LabelTaskType } from '@/commons/types';
import VToolbar from '@/components/VWindow/VToolbar.vue';
import { MouseOperationType, StrokeShapeType } from './types';

export default Vue.extend({
  name: 'ThePaintViewHeader',
  components: { VToolbar },
  props: {
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
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
      MouseOperationType,
      strokeWidthMenu: {
        options: [1, 5, 15],
        optionsText: ['1', '5', '15'],
      },
      strokeShapeMenu: {
        options: [StrokeShapeType.Circle, StrokeShapeType.Square],
        optionsText: ['Circle', 'Square'],
        optionsIcon: [this.$vuetify.icons.values.circle, this.$vuetify.icons.values.square],
      },
    };
  },
  computed: {
    mouseOperationButtons() {
      return [
        {
          title: 'pan & zoom',
          icon: this.$vuetify.icons.values.pan,
          mouseOperation: MouseOperationType.PanAndZoom,
          disabled: false,
        },
        {
          title: 'edit geometric object',
          icon: this.$vuetify.icons.values.hand,
          mouseOperation: MouseOperationType.EditGeometricObject,
          disabled: !this.classesNotEmpty,
        },
        {
          title: 'paint',
          icon: this.$vuetify.icons.values.paint,
          mouseOperation: MouseOperationType.PaintBrush,
          disabled: !this.classesNotEmpty,
        },
        {
          title: 'eraser',
          icon: this.$vuetify.icons.values.eraser,
          mouseOperation: MouseOperationType.PaintErase,
          disabled: !this.classesNotEmpty,
        },
      ];
    },
    objectShapeButtons() {
      return [
        {
          title: 'bounding polygon',
          icon: this.$vuetify.icons.values.drawPolygon,
          mouseOperation: MouseOperationType.ClickCreatePolygon,
          disabled: !this.classesNotEmpty,
        },
        {
          title: 'bounding box',
          icon: this.$vuetify.icons.values.drawSquare,
          mouseOperation: MouseOperationType.ClickCreateRect,
          disabled: !this.classesNotEmpty,
        },
        {
          title: 'critical point',
          icon: this.$vuetify.icons.values.drawCircle,
          mouseOperation: MouseOperationType.ClickCreatePoint,
          disabled: !this.classesNotEmpty,
        },
        {
          title: 'free-form contour',
          icon: this.$vuetify.icons.values.pen,
          mouseOperation: MouseOperationType.LassoCreatePolygon,
          disabled: !this.classesNotEmpty,
        },
      ];
    },
    enableObjectDetection(): boolean {
      return this.labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.ObjectDetection,
      ) >= 0;
    },
    enableImageSegmentation(): boolean {
      return this.labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.Segmentation,
      ) >= 0;
    },
    classesNotEmpty(): boolean {
      return this.classes.length !== 0;
    },
    mouseOperationIndex(): number | null {
      const { mouseOperation, mouseOperationButtons } = this;
      const index = mouseOperationButtons
        .findIndex((d) => d.mouseOperation === mouseOperation);
      if (index === -1) return null;
      return index;
    },
    objectShapeIndex(): number | null {
      const { mouseOperation, objectShapeButtons } = this;
      const index = objectShapeButtons
        .findIndex((d) => d.mouseOperation === mouseOperation);
      if (index === -1) return null;
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
      const { classes, label2color } = this;
      return classes.map((d: Label) => ({
        label: d,
        color: label2color(d),
      }));
    },
  },
  methods: {
    onResetImageSize() {
      this.$emit('reset:image-size');
    },
    onSetMouseOperation(mouseOperation: MouseOperationType) {
      this.$emit('set:mouse-operation', mouseOperation);
    },
    onSetStrokeShape(strokeShape: StrokeShapeType) {
      this.$emit('set:stroke-shape', strokeShape);
    },
    onSetStrokeWidth(strokeWidth: number) {
      this.$emit('set:stroke-width', strokeWidth);
    },
    onSetStrokeLabel(strokeLabel: Label) {
      this.$emit('set:stroke-label', strokeLabel);
    },
    onClickMinimize() {
      this.$emit('window:minimize');
    },
    onClickPin() {
      this.$emit('window:pin');
    },
  },
});
</script>
