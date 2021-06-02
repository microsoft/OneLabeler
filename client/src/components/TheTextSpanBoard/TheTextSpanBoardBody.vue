<template>
  <div
    style="width: 100%"
    v-click-outside="onClickOutside"
    @click="onClickInside"
    @mouseup="onMouseUp"
  >
    <!-- The annotated spans. -->
    <div ref="container">
      <div
        v-for="(box, i) in boxes"
        :key="`box-${i}`"
        :style="{
          'position': 'fixed',
          'width': `${box.right - box.left}px`,
          'height': `${box.bottom - box.top}px`,
          'left': `${box.left}px`,
          'top': `${box.top}px`,
          'background-color': getBoxColor(box.span.category),
          'border': isBoxSelected(box) ? 'gray 3px solid' : undefined
        }"
        @click="onSelectLabelSpan(box.span)"
      />
    </div>

    <!-- The content of the data object. -->
    <component
      ref="component"
      :is="component"
      :data-object="dataObject"
      :height="'100%'"
      :width="'100%'"
      @scroll="onScroll"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { color as d3color } from 'd3';
import {
  Category,
  DataType,
  IText,
  ILabelSpan,
} from '@/commons/types';
import dataTypeSetups from '@/builtins/data-types/index';

type Box = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  span: ILabelSpan;
}

export default Vue.extend({
  name: 'TheTextSpanBoardBody',
  props: {
    dataType: {
      type: String as PropType<DataType>,
      required: true,
    },
    dataObject: {
      type: Object as PropType<IText>,
      required: true,
    },
    labelSpans: {
      type: Array as PropType<ILabelSpan[] | null>,
      default: null,
    },
    brushCategory: {
      type: String as PropType<Category | null>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  data() {
    return {
      selectedLabelSpan: null as ILabelSpan | null,
      boxes: [] as Box[],
    };
  },
  watch: {
    async labelSpans() {
      await this.$nextTick();
      this.boxes = this.getBoxes();
    },
  },
  computed: {
    component(): VueConstructor | null {
      const { dataType } = this;
      const dataTypeSetup = dataTypeSetups.find((d) => d.type === dataType);
      if (dataTypeSetup === undefined) return null;
      return dataTypeSetup.display;
    },
  },
  async mounted() {
    await this.$nextTick();
    this.boxes = this.getBoxes();
  },
  methods: {
    onClickInside(e: MouseEvent): void {
      /** Find the top box that contains the clicked position. */
      const x = e.clientX;
      const y = e.clientY;
      const container = this.$refs.container as HTMLElement;
      const elements = document.elementsFromPoint(x, y) as HTMLElement[];
      const element = elements.find((d) => container.contains(d));
      if (element === undefined) return;
      element.click();
    },
    onClickOutside(): void {
      this.onSelectLabelSpan(null);
    },
    onMouseUp(): void {
      const selection = document.getSelection();
      if (selection === null) return;
      const { anchorNode } = selection;
      const textNode = this.getTextNode();
      if (anchorNode !== textNode) return;

      const text: string = selection.toString();
      const start: number = Math.min(selection.anchorOffset, selection.focusOffset);
      const end: number = Math.max(selection.anchorOffset, selection.focusOffset);
      // Clear the text selection.
      selection.empty();
      if (start === end || end < 0) return;
      if (this.brushCategory === null) return;
      const span: ILabelSpan = {
        text,
        start,
        end,
        category: this.brushCategory,
        uuid: uuidv4(),
      };
      this.$emit('create:span', span);
    },
    onSelectLabelSpan(labelSpan: ILabelSpan | null): void {
      this.$emit('select:span', labelSpan);
      this.selectedLabelSpan = labelSpan;
    },
    onScroll() {
      this.boxes = this.getBoxes();
    },
    isBoxSelected(box: Box): boolean {
      /** Whethe the box corresponds to a span annotation selected by the user. */
      const { selectedLabelSpan } = this;
      return (selectedLabelSpan !== null)
        && (selectedLabelSpan.uuid === box.span.uuid);
    },
    getTextNode(): Text {
      const component = this.$refs.component as Vue & { getTextNode: () => Text };
      const textNode: Text = component.getTextNode();
      return textNode;
    },
    getBoxColor(category: Category): string {
      const { label2color } = this;
      const color = d3color(label2color(category));
      if (color === null) return 'black';
      const { r, g, b } = color.rgb();
      return `rgba(${r}, ${g}, ${b}, 0.5)`;
    },
    getBoxes(): Box[] {
      // Compute the boxes to render for the span annotations.
      // Note: boxes depend on the rendering result of the text.
      // Thus it should not be a computed property,
      // as the HTML may not be updated when computed properties are computed.
      const { labelSpans } = this;
      const textNode = this.getTextNode();
      if (labelSpans === null) return [];
      const boxes: Box[] = labelSpans.reduce((acc: Box[], span: ILabelSpan) => {
        const range = document.createRange();
        if (span.end >= textNode.length) return acc;
        range.setStart(textNode, span.start);
        range.setEnd(textNode, span.end);
        return acc.concat([...range.getClientRects()].map((d) => ({
          top: d.top,
          bottom: d.bottom,
          left: d.left,
          right: d.right,
          span,
        })));
      }, []);
      return boxes;
    },
  },
});
</script>
