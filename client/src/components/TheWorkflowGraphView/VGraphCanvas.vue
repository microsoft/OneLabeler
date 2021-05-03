<template>
  <svg
    ref="svg"
    @contextmenu="onContextMenu"
  >
    <g ref="g">
      <slot />
    </g>
  </svg>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import * as d3 from 'd3';

interface Box {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

export default Vue.extend({
  name: 'VGraphCanvas',
  props: {
    enableZoom: {
      type: Boolean,
      default: true,
    },
    zoomBox: {
      type: Object as PropType<Box | null>,
      default: null,
    },
  },
  data() {
    return {
      zoomInstance: null as d3.ZoomBehavior<HTMLElement, unknown> | null,
    };
  },
  watch: {
    zoomBox(val) {
      this.zoomTo(val, 300);
    },
    enableZoom(val) {
      if (val === false) {
        this.unbindZoom();
      } else if (val === true) {
        this.bindZoom();
      }
    },
  },
  mounted() {
    this.bindZoom();
    if (!this.enableZoom) this.unbindZoom();
  },
  methods: {
    onContextMenu(e: MouseEvent) {
      const transform = d3.zoomTransform(this.$refs.g as HTMLElement);
      const tx = transform.x;
      const ty = transform.y;
      const { k } = transform;
      const [x, y] = d3.pointer(e, this.$refs.svg);
      const xScaled = (x - tx) / k;
      const yScaled = (y - ty) / k;
      this.$emit('contextmenu', e, { xScaled, yScaled });
    },
    resetZoom(delay: number | null = null) {
      const svg = d3.select(this.$refs.svg as HTMLElement);
      const { zoomInstance } = this;
      let selection = svg;
      if (delay !== null) {
        selection = svg.transition()
          .duration(delay);
      }
      selection.call(zoomInstance.transform, d3.zoomIdentity);
    },
    zoomTo(box: Box, delay: number | null = null) {
      const { zoomInstance } = this;
      const {
        xMin, xMax, yMin, yMax,
      } = box;

      const { svg } = this.$refs as { svg: HTMLElement };
      const zoomToWidth = xMax - xMin;
      const zoomToHeight = yMax - yMin;
      const svgWidth = svg.clientWidth;
      const svgHeight = svg.clientHeight;
      const scale = Math.min(
        svgWidth / Math.max(zoomToWidth, 20),
        svgHeight / Math.max(zoomToHeight, 20),
      );
      const cx = (xMax + xMin) / 2;
      const cy = (yMax + yMin) / 2;

      let selection = d3.select(svg);
      if (delay !== null) {
        selection = selection.transition()
          .duration(delay);
      }

      // note: the zoom transformation applies from right to left
      selection.call(
        zoomInstance.transform,
        d3.zoomIdentity
          .translate(svgWidth / 2, svgHeight / 2)
          .scale(scale)
          .translate(-cx, -cy),
      );
    },
    bindZoom() {
      const svg = d3.select(this.$refs.svg as HTMLElement);
      const g = d3.select(this.$refs.g as SVGGElement);
      const zoomInstance = d3.zoom().on('zoom', (event) => {
        // k < 1 is zoom out (size smaller than original)
        // k > 1 is zoom in (size larger than original)
        // (x, y) is the coordinate of the upper left corner of the current image
        // to the upper left corner of the upper left corner of the original image
        const { transform } = event;
        const { x, y, k } = transform;
        const svgElement = svg.node() as HTMLElement;
        const svgWidth = svgElement.clientWidth;
        const svgHeight = svgElement.clientHeight;
        const xMin = -x / k;
        const yMin = -y / k;
        const xMax = xMin + svgWidth / k;
        const yMax = yMin + svgHeight / k;
        this.$emit('zoom', {
          xMin, xMax, yMin, yMax,
        });
        g.attr('transform', transform);
      });
      svg.call(zoomInstance);
      svg.on('dblclick.zoom', null); // avoid evoking zoom when dblclick
      this.zoomInstance = zoomInstance;
    },
    unbindZoom() {
      const svg = d3.select(this.$refs.svg as HTMLElement);
      svg.on('.zoom', null);
    },
  },
});
</script>
