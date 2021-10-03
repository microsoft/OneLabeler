<template>
  <div
    ref="container"
    v-click-outside="onClickOutside"
    style="width: 100%"
    @click="onClickInside"
  >
    <!-- The annotated spans. -->
    <div ref="annotations">
      <div
        v-for="(box, i) in boxes"
        :key="`box-${i}`"
        :style="{
          'position': 'fixed',
          'width': `${box.right - box.left}px`,
          'height': `${box.bottom - box.top}px`,
          'left': `${box.left}px`,
          'top': `${box.top}px`,
          'background-color': getSpanColor(box.span.category),
          'border': isBoxSelected(box) ? 'gray 3px solid' : undefined
        }"
        @click="onSelectLabelSpan(box.span)"
      />
    </div>

    <!-- The content of the data object. -->
    <div
      ref="content"
      style="position: relative; width: 100%; height: 100%; display: flex;"
    >
      <component
        :is="component"
        ref="dataObject"
        :data-object="dataObject"
        :label="label"
        :label2color="label2color"
        :height="'100%'"
        :width="'100%'"
        @scroll="onScroll"
      />
      <component
        v-for="(setup, i) in taskSetups"
        :key="i"
        :is="setup.panel"
        :label="label"
        :label2color="label2color"
        :label-tasks="labelTasks"
        :selected-span="selectedSpan"
        :class="{ 'ml-0': i !== 0 }"
        class="ma-2"
        style="flex: 1 1 30%"
        @upsert:label="$emit('upsert:label', $event)"
        @select:span="onSelectLabelSpan"
        @remove:span="$emit('remove:span', $event)"
        @create:relation="$emit('create:relation', $event)"
        @remove:relation="$emit('remove:relation', $event)"
      />
    </div>
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
  ILabel,
  ILabelTextSpan,
  ILabelTaskTypeSetup,
  LabelTaskType,
} from '@/commons/types';
import dataTypeSetups from '@/builtins/data-types/index';
import labelTaskTypeSetups from '@/builtins/label-task-types/index';

type Box = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  span: ILabelTextSpan;
}

export default Vue.extend({
  name: 'TheTextSpanBoardBody',
  props: {
    dataType: {
      type: String as PropType<DataType>,
      required: true,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    dataObject: {
      type: Object as PropType<IText>,
      required: true,
    },
    label: {
      type: Object as PropType<ILabel | null>,
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
      selectedSpan: null as ILabelTextSpan | null,
      boxes: [] as Box[],
      resizeObserver: null as ResizeObserver | null,
    };
  },
  computed: {
    taskSetups(): ILabelTaskTypeSetup[] {
      const { labelTasks } = this;
      return labelTaskTypeSetups
        .filter((d) => (labelTasks as string[]).includes(d.type))
        .filter((d) => d.panel !== undefined);
    },
    component(): VueConstructor | null {
      const { dataType } = this;
      const dataTypeSetup = dataTypeSetups.find((d) => d.type === dataType);
      if (dataTypeSetup === undefined) return null;
      return dataTypeSetup.display;
    },
    labelSpans(): ILabelTextSpan[] | null {
      return this.label?.spans ?? null;
    },
  },
  watch: {
    dataObject() {
      this.selectedSpan = null;
    },
    async labelSpans() {
      await this.$nextTick();
      this.boxes = this.getBoxes();
    },
    brushCategory() {
      // When changing brush category,
      // try to create a span if there exists a selection
      // for which a span has not been created.
      this.onCreateSpan();
    },
  },
  beforeDestroy(): void {
    (this.resizeObserver as ResizeObserver).disconnect();
  },
  async mounted() {
    await this.$nextTick();
    this.boxes = this.getBoxes();
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(this.$refs.container as HTMLElement);
  },
  methods: {
    onClickInside(e: MouseEvent): void {
      // Find the top box that contains the clicked position.
      const x = e.clientX;
      const y = e.clientY;
      const annotations = this.$refs.annotations as HTMLElement;
      const elements = document.elementsFromPoint(x, y) as HTMLElement[];
      const element = elements.find((d) => annotations.contains(d));
      if (element !== undefined) element.click();
      this.onCreateSpan();
    },
    onClickOutside(): void {
      // Unselect label span.
      this.onSelectLabelSpan(null);
    },
    onCreateSpan(): void {
      if (this.brushCategory === null) return;
      const selection = document.getSelection();
      if (selection === null) return;
      const { anchorNode } = selection;
      const textNode = this.getTextNode();
      // Check if the selection starts at the text node.
      if (anchorNode !== textNode) return;

      const text: string = selection.toString();
      // Note: the index is zero based (first letter has index 0).
      const start: number = Math.min(selection.anchorOffset, selection.focusOffset);
      const end: number = Math.max(selection.anchorOffset, selection.focusOffset);
      // Clear the text selection.
      selection.empty();
      if (start === end || end < 0) return;
      const span: ILabelTextSpan = {
        text,
        start,
        end,
        category: this.brushCategory,
        uuid: uuidv4(),
      };
      this.$emit('create:span', span);
      this.onSelectLabelSpan(null);
    },
    onSelectLabelSpan(labelSpan: ILabelTextSpan | null): void {
      this.$emit('select:span', labelSpan);
      this.selectedSpan = labelSpan;
    },
    onScroll(): void {
      this.boxes = this.getBoxes();
    },
    onResize(): void {
      this.boxes = this.getBoxes();
    },
    isBoxSelected(box: Box): boolean {
      // Whether the box corresponds to a span annotation selected by the user.
      const { selectedSpan } = this;
      return (selectedSpan !== null)
        && (selectedSpan.uuid === box.span.uuid);
    },
    getTextNode(): Text {
      const dataObjectElement = this.$refs.dataObject as Vue & { getTextNode: () => Text };
      const textNode: Text = dataObjectElement.getTextNode();
      return textNode;
    },
    getSpanColor(category: Category): string {
      const { label2color } = this;
      const color = d3color(label2color(category));
      if (color === null) return 'black';
      const { r, g, b } = color.rgb();
      return `rgba(${r}, ${g}, ${b}, 0.5)`;
    },
    getViewPort(): DOMRect {
      return (this.$refs.content as HTMLElement).getBoundingClientRect();
    },
    getBoxes(): Box[] {
      // Compute the boxes to render for the span annotations.
      // Note: boxes depend on the rendering result of the text.
      // Thus it should not be a computed property,
      // as the HTML may not be updated when computed properties are computed.
      const { labelSpans } = this;
      const textNode = this.getTextNode();
      const boundingBox = this.getViewPort();
      if (labelSpans === null) return [];
      const boxes: Box[] = labelSpans.reduce((acc: Box[], span: ILabelTextSpan) => {
        const range = document.createRange();
        if (span.end >= textNode.length) return acc;
        range.setStart(textNode, span.start);
        range.setEnd(textNode, span.end);

        // Do not plot the spans outside the viewport.
        const rects = [...range.getClientRects()]
          .filter((rect) => (
            rect.top <= boundingBox.bottom
            && rect.bottom >= boundingBox.top
            && rect.left <= boundingBox.right
            && rect.right >= boundingBox.left
          ));

        // Clip the spans to fit inside the viewport.
        return acc.concat(rects.map((d) => ({
          top: Math.max(d.top, boundingBox.top),
          bottom: Math.min(d.bottom, boundingBox.bottom),
          left: Math.max(d.left, boundingBox.left),
          right: Math.min(d.right, boundingBox.right),
          span,
        })));
      }, []);
      return boxes;
    },
  },
});
</script>
