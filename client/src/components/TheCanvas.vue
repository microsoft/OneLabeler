<template>
  <svg
    :id="svgId"
    style="display: block; height: 100%; width: 100%"
  >
    <g :id="gId">
      <image
        :id="imgId"
        :xlink:href="imgObj.src"
        style="image-rendering: pixelated"
        opacity="0.5"
      />
    </g>
  </svg>
</template>

<script lang="ts">
import Vue from 'vue';
import { Selection, ZoomBehavior } from 'd3';
import { mapState } from 'vuex';
import * as d3 from 'd3';
import { getHeight, getWidth } from '@/plugins/html-helper';
import { IImage } from '@/types/index';

type HTMLSVGElement = HTMLElement & SVGElement;

interface IScope {
  xMin: number | null,
  xMax: number | null,
  yMin: number | null,
  yMax: number | null,
}

export default Vue.extend({
  name: 'CanvasView',
  props: {
    svgId: {
      type: String,
      default: `canvas-svg-${Math.floor(Math.random() * 100000000)}`,
    },
    gId: {
      type: String,
      default: `canvas-g-${Math.floor(Math.random() * 100000000)}`,
    },
    imgId: {
      type: String,
      default: `canvas-img-${Math.floor(Math.random() * 100000000)}`,
    },
  },
  data(): { zoomInstance: ZoomBehavior<HTMLSVGElement, unknown> } {
    return {
      zoomInstance: d3.zoom(),
    };
  },
  computed: {
    ...mapState([
      'imgObj',
    ]),
  },
  watch: {
    imgObj(val: IImage): void {
      const { width, height } = val;
      this.zoomTo({
        xMin: 0, xMax: width, yMin: 0, yMax: height,
      }, null);
    },
  },
  mounted(): void {
    this.bindZoom();
    const { width, height } = this.imgObj;
    this.zoomTo({
      xMin: 0, xMax: width, yMin: 0, yMax: height,
    }, null);
  },
  methods: {
    /**
     * @description Bind d3.zoom instance to svg.
     */
    bindZoom(): void {
      const g = d3.select(`#${this.gId}`);
      const svg = d3.select(`#${this.svgId}`) as Selection<HTMLSVGElement, unknown, Element, unknown>;
      const zoom = d3.zoom().on('zoom', (event) => {
        g.attr('transform', event.transform);
      }) as unknown as ZoomBehavior<HTMLSVGElement, unknown>;
      svg.call(zoom);
      svg.on('dblclick.zoom', null); // avoid evoking zoom when dblclick
      this.zoomInstance = zoom;
    },
    /**
     * @param {?Object} imgScope - The area of image to be zoomed to.
     * When imgScope is null, reset the zoom.
     * @param {Number} imgScope.xMin
     * @param {Number} imgScope.yMin
     * @param {Number} imgScope.xMax
     * @param {Number} imgScope.yMax
     * @param {?Number} delay The duration of transition animiation.
     * @description Zoom by setting transform of g in svg
     */
    zoomTo(imgScope: IScope, delay: number | null = null): void {
      // check whether to reset the zoom
      let reset = false;
      if (imgScope === null) { reset = true; }
      const {
        xMin, xMax, yMin, yMax,
      } = imgScope;
      if (xMin === null || xMax === null || yMin === null || yMax === null) { reset = true; }

      const svg = document.getElementById(this.svgId) as HTMLSVGElement;
      const { zoomInstance } = this;

      if (reset) {
        let selection = d3.select(svg);
        if (delay !== null) {
          selection = selection.transition()
            .duration(delay) as unknown as Selection<HTMLSVGElement, unknown, null, undefined>;
        }
        selection.call(zoomInstance.transform, d3.zoomIdentity);
        return;
      }

      const zoomToWidth = (xMax as number) - (xMin as number);
      const zoomToHeight = (yMax as number) - (yMin as number);
      const svgWidth = getWidth(svg);
      const svgHeight = getHeight(svg);
      const scale = Math.min(
        svgWidth / Math.max(zoomToWidth, 20),
        svgHeight / Math.max(zoomToHeight, 20),
      );
      const cx = ((xMax as number) + (xMin as number)) / 2;
      const cy = ((yMax as number) + (yMin as number)) / 2;

      let selection = d3.select(svg);
      if (delay !== null) {
        selection = selection.transition()
          .duration(delay) as unknown as Selection<HTMLSVGElement, unknown, null, undefined>;
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
  },
});
</script>
