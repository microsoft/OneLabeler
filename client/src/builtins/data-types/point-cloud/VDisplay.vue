<template>
  <div
    ref="container"
    :style="{
      width: widthStr,
      height: heightStr,
      'font-size': '24px',
      'line-height': 'initial',
    }"
  >
    <canvas ref="canvas" />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import * as BABYLON from 'babylonjs';
import { IPointCloud, Vector3d } from '@/commons/types';

export default Vue.extend({
  name: 'VDisplay',
  props: {
    /** @description The data object to be rendered. */
    dataObject: {
      type: Object as PropType<IPointCloud>,
      required: true,
    },
    /** @description The width of the svg as a number or string of form '...%'. */
    width: {
      type: [Number, String],
      default: undefined,
      validator(val) {
        return typeof val === 'number'
          || (typeof val === 'string' && /^([0-9]+)%$/.test(val));
      },
    },
    /** @description The height of the svg as a number or string of form '...%'. */
    height: {
      type: [Number, String],
      default: undefined,
      validator(val) {
        return typeof val === 'number'
          || (typeof val === 'string' && /^([0-9]+)%$/.test(val));
      },
    },
  },
  data() {
    return {
      resizeObserver: null as ResizeObserver | null,
    };
  },
  computed: {
    widthStr(): string {
      const { width } = this;
      if (typeof width === 'number') return `${width}px`;
      return width;
    },
    heightStr(): string {
      const { height } = this;
      if (typeof height === 'number') return `${height}px`;
      return height;
    },
    points(): Vector3d[] | null {
      if (this.dataObject === null) return null;
      return this.dataObject.content;
    },
  },
  watch: {
    widthStr() {
      this.render();
    },
    heightStr() {
      this.render();
    },
  },
  beforeDestroy(): void {
    (this.resizeObserver as ResizeObserver).disconnect();
  },
  mounted() {
    const container = this.$refs.container as HTMLDivElement;
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(container);
    this.render();
  },
  methods: {
    onResize(): void {
      this.render();
    },
    render(): void {
      const { points } = this;
      if (points === null) return;

      const canvas = this.$refs.canvas as HTMLCanvasElement;

      canvas.style.width = this.widthStr;
      canvas.style.height = this.heightStr;

      const engine = new BABYLON.Engine(canvas);
      const scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0.8, 0.8, 0.8, 1.0);

      const renderLoop = () => scene.render();
      engine.runRenderLoop(renderLoop);

      const camera = new BABYLON.ArcRotateCamera(
        'camera',
        -Math.PI / 2,
        Math.PI / 2, 2,
        new BABYLON.Vector3(0, 0, 0),
        scene,
      );
      camera.attachControl(canvas, true);

      const light = new BABYLON.PointLight('light', new BABYLON.Vector3(10, 10, 0), scene);

      const pointSize = 5;
      const pcs = new BABYLON.PointsCloudSystem('pcs', pointSize, scene);
      const cloudColor = new BABYLON.Color4(1, 1, 1, 1);

      const pointFunc = (particle: BABYLON.CloudPoint) => {
        const { idx } = particle;
        const point = points[idx];
        const [x, y, z] = point;
        pcs.particles[idx].position = new BABYLON.Vector3(x, y, z);
        pcs.particles[idx].color = cloudColor;
      };
      pcs.addPoints(points.length, pointFunc);
      pcs.buildMeshAsync();
    },
  },
});
</script>
