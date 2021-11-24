<template>
  <div style="display: grid">
    <div
      ref="container"
      class="data-object-container"
      style="grid-area: 1 / 1 / 2 / 2; "
    >
      <canvas
        ref="canvas"
        class="data-object-content"
      />
    </div>

    <slot
      name="overlay"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
} from '@vue/composition-api';
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import type { IPdf } from '@/commons/types';

/**
 * TODO:
 * 1. support pdf scrolling
 * 2. support pdf pagination
 * 3. support text element selection
 */

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default defineComponent({
  name: 'BaseDisplay',
  props: {
    /** The data object to be rendered. */
    dataObject: {
      type: Object as PropType<IPdf>,
      required: true,
    },
  },
  async mounted() {
    const { content } = this.dataObject;
    if (content === null || content === undefined) return;
    const loadingTasks = pdfjs.getDocument(content);

    const pdf = await loadingTasks.promise;
    const page = await pdf.getPage(1);
    const scale = 1;
    const viewport = page.getViewport({ scale });

    const canvas = this.$refs.canvas as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

    const renderContext = {
      canvasContext: context,
      viewport,
    };
    page.render(renderContext);
  },
});
</script>

<style scoped>
.data-object-container {
  position: relative;
}

.data-object-content {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
