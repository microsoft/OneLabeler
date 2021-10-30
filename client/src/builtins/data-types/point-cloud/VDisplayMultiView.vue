<template>
  <div
    ref="container"
    class="grids-container"
  >
    <div class="top-canvas-container">
      <canvas
        ref="canvasTop"
        class="render-canvas"
      />
    </div>
    <div class="front-canvas-container">
      <canvas
        ref="canvasFront"
        class="render-canvas"
      />
    </div>
    <div class="left-canvas-container">
      <canvas
        ref="canvasLeft"
        class="render-canvas"
      />
    </div>

    <div style="grid-area: 1 / 2 / 4 / 5; display: grid">
      <div
        ref="container"
        class="main-canvas-container"
        style="grid-area: 1 / 1 / 2 / 2"
      >
        <canvas
          ref="canvasMain"
          class="render-canvas"
        />
      </div>
      <slot
        name="overlay"
        :on-segment3d="onSegment3d"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  toRefs,
  onMounted,
  watch,
  ComputedRef,
  PropType,
  Ref,
} from '@vue/composition-api';
import { polygonContains } from 'd3';
import * as BABYLON from 'babylonjs';
import {
  Category,
  ILabel,
  ILabelPoints,
  IPointCloud,
  Vector3d,
} from '@/commons/types';
import useResizeObserver from '@/components/composables/useResizeObserver';

/**
 * Implementation note:
 *
 * - To make the canvas component to have responsive size,
 * set canvas component container to have position: relative,
 * and set canvas component to have position: absolute; width: 100%; height: 100%;.
 * If directly set canvas component to have width: 100%; height: 100%;.
 * it will stretch to preserve the aspect ratio, which stretches the container.
 * Reference: https://css-tricks.com/fluid-width-video/
 *
 * - rendering on multiple canvas with different size is buggy in babylonjs 4.2.
 * Thus needs babylonjs version >= 5.0
 * Reference: https://forum.babylonjs.com/t/multiple-scenes-on-different-canvas-using-single-engine
 */

export default defineComponent({
  name: 'VDisplay',
  props: {
    /** @description The data object to be rendered. */
    dataObject: {
      type: Object as PropType<IPointCloud>,
      required: true,
    },
    /** @description The data label. */
    label: {
      type: Object as PropType<ILabel>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      default: null,
    },
  },
  setup(props) {
    const { dataObject } = toRefs(props);

    const container: Ref<HTMLElement | null> = ref(null);
    const canvasMain: Ref<HTMLCanvasElement | null> = ref(null);
    const canvasTop: Ref<HTMLCanvasElement | null> = ref(null);
    const canvasFront: Ref<HTMLCanvasElement | null> = ref(null);
    const canvasLeft: Ref<HTMLCanvasElement | null> = ref(null);

    let engine: BABYLON.Engine | null = null;
    let scene: BABYLON.Scene | null = null;
    let cameraMain: BABYLON.ArcRotateCamera | null = null;
    const canvas = document.createElement('canvas');
    const pcs: Ref<BABYLON.PointsCloudSystem | null> = ref(null);

    const points: ComputedRef<Vector3d[] | null> = computed(() => (
      dataObject.value?.content ?? null
    ));

    const render = (): void => {
      if (points.value === null) return;
      if (canvasMain.value === null) return;
      if (canvasTop.value === null) return;
      if (canvasFront.value === null) return;
      if (canvasLeft.value === null) return;

      // Set engine and scene.
      if (engine !== null) engine.dispose();
      engine = new BABYLON.Engine(canvas);
      engine.inputElement = canvasMain.value;
      scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0.8, 0.8, 0.8, 1.0);
      engine.runRenderLoop(() => {
        if (scene?.activeCamera) {
          scene.render();
        }
      });

      // Set camera and register for main view.
      cameraMain = new BABYLON.ArcRotateCamera(
        'cameraMain',
        0,
        0,
        2,
        BABYLON.Vector3.Zero(),
        scene,
      );
      cameraMain.setTarget(BABYLON.Vector3.Zero());
      cameraMain.wheelPrecision = 40;
      cameraMain.lowerRadiusLimit = 2;
      cameraMain.upperRadiusLimit = 5;
      cameraMain.attachControl(null, true);
      engine.registerView(canvasMain.value);

      // Set camera and register for top view.
      const cameraTop = new BABYLON.UniversalCamera(
        'cameraTop',
        new BABYLON.Vector3(0, 2, 0),
        scene,
      );
      cameraTop.setTarget(BABYLON.Vector3.Zero());
      engine.registerView(canvasTop.value, cameraTop);

      // Set camera and register for front view.
      const cameraFront = new BABYLON.UniversalCamera(
        'cameraFront',
        new BABYLON.Vector3(0, 0, -2),
        scene,
      );
      cameraFront.setTarget(BABYLON.Vector3.Zero());
      engine.registerView(canvasFront.value, cameraFront);

      // Set camera and register for left view.
      const cameraLeft = new BABYLON.UniversalCamera(
        'cameraLeft',
        new BABYLON.Vector3(-2, 0, 0),
        scene,
      );
      cameraLeft.setTarget(BABYLON.Vector3.Zero());
      engine.registerView(canvasLeft.value, cameraLeft);

      // Set point cloud system.
      const pointSize = 3;
      pcs.value = new BABYLON.PointsCloudSystem('pcs', pointSize, scene);
      const cloudColor = new BABYLON.Color4(1, 1, 1, 1);
      const pointFunc = (particle: BABYLON.CloudPoint) => {
        if (pcs.value === null || points.value === null) return;
        const { idx } = particle;
        const point = points.value[idx];
        const [x, y, z] = point;
        pcs.value.particles[idx].position = new BABYLON.Vector3(x, y, z);
        pcs.value.particles[idx].color = cloudColor;
      };
      pcs.value.addPoints(points.value.length, pointFunc);
      pcs.value.buildMeshAsync();
    };

    const project = (point: BABYLON.Vector3): BABYLON.Vector2 | null => {
      if (
        canvasMain.value === null
        || cameraMain === null
        || engine === null
      ) return null;
      const viewport = cameraMain.viewport.toGlobal(
        canvasMain.value.width,
        canvasMain.value.height,
      );
      const vector = BABYLON.Vector3.Project(
        point,
        BABYLON.Matrix.Identity(),
        cameraMain.getTransformationMatrix(),
        viewport,
      );
      return new BABYLON.Vector2(vector.x, vector.y);
    };

    onMounted(render);
    watch(dataObject, render);
    useResizeObserver(container, () => engine?.resize());

    return {
      container,
      canvasMain,
      canvasFront,
      canvasTop,
      canvasLeft,
      pcs,
      points,
      project,
    };
  },
  computed: {
    pointLabels(): ILabelPoints | null {
      return this.label.pointLabels ?? null;
    },
  },
  watch: {
    pointLabels(): void {
      const { pcs } = this;
      if (pcs === null) return;
      this.setPointColors();
      pcs.setParticles();
    },
    label2color(): void {
      const { pcs } = this;
      if (pcs === null) return;
      this.setPointColors();
      pcs.setParticles();
    },
  },
  methods: {
    setPointColors(): void {
      // Update point colors according to point labels.
      const { pointLabels, pcs, label2color } = this;
      if (pcs === null || pointLabels === null || label2color === null) return;
      for (let i = 0; i < pcs.particles.length; i += 1) {
        pcs.particles[i].color = BABYLON.Color4.FromColor3(
          BABYLON.Color3.FromHexString(label2color(pointLabels[i])),
        );
      }
    },
    onSegment3d(
      polygon: [number, number][],
      category: Category,
    ): void {
      const { points, pointLabels, project } = this;
      if (points === null || pointLabels === null) return;
      const points2d = points.map((d) => project(new BABYLON.Vector3(d[0], d[1], d[2])));
      const pointLabelsUpdated = [...pointLabels].map((d, i) => {
        const p = points2d[i];
        const isInPolygon = p === null ? false : polygonContains(polygon, [p.x, p.y]);
        return isInPolygon ? category : d;
      });
      this.$emit('upsert:label', { pointLabels: pointLabelsUpdated });
    },
  },
});
</script>

<style lang="scss" scoped>
.grids-container {
  $margin: 4px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: $margin;
}

.canvas-container {
  position: relative;
  min-width: 0;
  min-height: 0;
}

.top-canvas-container {
  @extend .canvas-container;
  grid-area: 1 / 1 / 2 / 2;
}

.front-canvas-container {
  @extend .canvas-container;
  grid-area: 2 / 1 / 3 / 2;
}

.left-canvas-container {
  @extend .canvas-container;
  grid-area: 3 / 1 / 4 / 2;
}

.main-canvas-container {
  @extend .canvas-container;
}

.render-canvas {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
