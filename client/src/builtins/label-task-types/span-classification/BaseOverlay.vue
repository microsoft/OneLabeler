<template>
  <div
    ref="container"
    style="pointer-events: none"
  >
    <div
      v-for="(box, i) in boxes"
      :key="i"
      style="position: fixed; pointer-events: initial;"
      :style="{
        'width': `${box.right - box.left}px`,
        'height': `${box.bottom - box.top}px`,
        'left': `${box.left}px`,
        'top': `${box.top}px`,
        // 8-digit hex notation with opacity stored
        'background-color': `${label2color(box.span.category)}80`,
        'border': isBoxSelected(box) ? 'gray 3px solid' : undefined,
      }"
      @click="onSelectLabelSpan(box.span)"
    />
  </div>
</template>

<script lang="ts">
import { v4 as uuidv4 } from 'uuid';
import {
  computed,
  defineComponent,
  ref,
  toRefs,
  nextTick,
  onBeforeUnmount,
  onMounted,
  watch,
  PropType,
  Ref,
} from '@vue/composition-api';
import {
  ILabel,
  ILabelTextSpan,
  IText,
} from '@/commons/types';
import useResizeObserver from '@/components/composables/useResizeObserver';
import { Box, ToolbarState } from './types';
import useBoxes from './useBoxes';

const useKey = (onDelete: () => void): void => {
  const onKey = (e: KeyboardEvent): void => {
    const { key } = e;

    if (key === 'Delete') onDelete();
  };

  onMounted(() => {
    // Bind keyboard events.
    window.addEventListener('keydown', onKey);
  });
  onBeforeUnmount(() => {
    // Remove listener before distroy,
    // otherwise the onKey method will be called multiple times.
    window.removeEventListener('keydown', onKey);
  });
};

export default defineComponent({
  name: 'BaseOverlay',
  props: {
    dataObject: {
      type: Object as PropType<IText>,
      required: true,
    },
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    toolbarState: {
      type: Object as PropType<ToolbarState | null>,
      default: null,
    },
    getTextNode: {
      type: Function as PropType<() => Text>,
      required: true,
    },
    getEventNode: {
      type: Function as PropType<() => HTMLElement>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const {
      dataObject,
      label,
      getTextNode,
      toolbarState,
    } = toRefs(props);

    const container: Ref<HTMLDivElement | null> = ref(null);
    const boxes: Ref<Box[]> = ref([]);

    const labelSpans = computed(() => label.value?.spans ?? null);
    const labelRelations = computed(() => label.value?.relations ?? null);
    const selectedSpan = computed(() => toolbarState.value?.selectedSpan ?? null);
    const strokeCategory = computed(() => toolbarState.value?.strokeCategory ?? null);

    const getBoxes = useBoxes(
      labelSpans,
      getTextNode,
      container,
    );
    const updateBoxes = (): void => { boxes.value = getBoxes(); };

    onMounted(async () => {
      await nextTick();
      updateBoxes();
    });
    watch(labelSpans, async () => {
      await nextTick();
      updateBoxes();
    });
    useResizeObserver(container, updateBoxes);

    const removeLabelSpan = (span: ILabelTextSpan): void => {
      if (labelSpans.value === null) return;

      // Remove the relations that involves the label span.
      const relations = labelRelations.value?.filter((d) => (
        d.sourceUuid !== span.uuid && d.targetUuid !== span.uuid
      ));
      // Remove the label span itself.
      const spans = labelSpans.value.filter((d) => d.uuid !== span.uuid);
      emit('upsert:label', { relations, spans } as Partial<ILabel>);
    };

    useKey(() => {
      if (selectedSpan.value !== null) removeLabelSpan(selectedSpan.value);
    });

    const onSelectLabelSpan = (labelSpan: ILabelTextSpan | null): void => {
      if (labelSpan !== null) {
        const partial: Partial<ToolbarState> = {
          strokeCategory: labelSpan.category,
          selectedSpan: labelSpan,
        };
        emit('upsert:toolbar-state', partial);
      } else {
        const partial: Partial<ToolbarState> = {
          selectedSpan: labelSpan,
        };
        emit('upsert:toolbar-state', partial);
      }
    };
    const onTryCreateSpan = (): void => {
      if (strokeCategory.value === null) return;
      const selection = document.getSelection();
      if (selection === null) return;
      const { anchorNode } = selection;
      const textNode = getTextNode.value();
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
        category: strokeCategory.value,
        uuid: uuidv4(),
      };

      const spans = [...(labelSpans.value ?? []), span];
      emit('upsert:label', { spans } as Partial<ILabel>);
      onSelectLabelSpan(null);
    };
    const onScrollMedium = updateBoxes;
    const onClickMedium = (e: MouseEvent): void => {
      // Broadcast the click event from the medium to the text box.
      // Find the top box that contains the clicked position.
      const x = e.clientX;
      const y = e.clientY;
      const elements = document.elementsFromPoint(x, y) as HTMLElement[];
      const element = elements.find((d) => container.value?.contains(d));
      if (element !== undefined) {
        element.click();
      } else {
        onSelectLabelSpan(null);
      }
      onTryCreateSpan();
    };
    const isBoxSelected = (box: Box): boolean => (
      // Whether the box corresponds to a span annotation selected by the user.
      (selectedSpan.value !== null)
      && (selectedSpan.value.uuid === box.span.uuid)
    );

    watch(dataObject, () => {
      const partial: Partial<ToolbarState> = {
        selectedSpan: null,
        strokeCategory: null,
      };
      emit('upsert:toolbar-state', partial);
    });
    watch(strokeCategory, () => {
      // When changing brush category,
      // try to create a span if there exists a text selection
      // for which a span has not been created.
      onTryCreateSpan();

      // If there exist a label span selection, change its category.
      if (
        selectedSpan.value === null
        || strokeCategory.value === null
        || labelSpans.value === null
      ) return;

      const spans = labelSpans.value.map((d) => (
        d.uuid === selectedSpan.value?.uuid
          ? { ...selectedSpan.value, category: strokeCategory.value }
          : d
      ));
      emit('upsert:label', { spans } as Partial<ILabel>);
    });

    return {
      container,
      boxes,
      onScrollMedium,
      onClickMedium,
      onSelectLabelSpan,
      isBoxSelected,
    };
  },
  mounted() {
    const medium = this.getEventNode();
    medium.onclick = this.onClickMedium;
    medium.onscroll = this.onScrollMedium;
  },
});
</script>
