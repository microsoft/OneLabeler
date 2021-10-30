<template>
  <div style="display: grid">
    <div
      ref="container"
      class="data-object-container"
      style="grid-area: 1 / 1 / 2 / 2"
    >
      <canvas
        ref="canvas"
        class="data-object-content"
      />
    </div>
    <slot
      name="overlay"
      :on-segment3d="onSegment3d"
    />
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
  IPointCloud,
  Vector3d,
} from '@/commons/types';
import useResizeObserver from '@/components/composables/useResizeObserver';

/**
 * Implementation note:
 * To make the canvas component to have responsive size,
 * set canvas component container to have position: relative,
 * and set canvas component to have position: absolute; width: 100%; height: 100%;.
 * If directly set canvas component to have width: 100%; height: 100%;.
 * it will stretch to preserve the aspect ratio, which stretches the container.
 * Reference: https://css-tricks.com/fluid-width-video/
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
    const { dataObject, label, label2color } = toRefs(props);

    const container: Ref<HTMLElement | null> = ref(null);
    const canvas: Ref<HTMLCanvasElement | null> = ref(null);

    let engine: BABYLON.Engine | null = null;
    let scene: BABYLON.Scene | null = null;
    let camera: BABYLON.ArcRotateCamera | null = null;
    const pcs: Ref<BABYLON.PointsCloudSystem | null> = ref(null);

    const points: ComputedRef<Vector3d[] | null> = computed(() => (
      dataObject.value?.content ?? null
    ));
    const pointLabels: ComputedRef<string[] | null> = computed(() => (
      label.value?.pointLabels ?? null
    ));

    const render = (): void => {
      if (points.value === null) return;
      if (canvas.value === null) return;

      // Set engine and scene.
      if (engine !== null) engine.dispose();
      engine = new BABYLON.Engine(canvas.value);
      scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0.8, 0.8, 0.8, 1.0);
      const renderLoop = () => scene?.render();
      engine.runRenderLoop(renderLoop);

      // Set camera.
      camera = new BABYLON.ArcRotateCamera(
        'camera',
        0,
        0,
        2,
        BABYLON.Vector3.Zero(),
        scene,
      );
      camera.wheelPrecision = 40;
      camera.lowerRadiusLimit = 2;
      camera.upperRadiusLimit = 5;
      camera.attachControl(canvas, true);

      // Set point cloud system.
      const pointSize = 3;
      pcs.value = new BABYLON.PointsCloudSystem('pcs', pointSize, scene);
      const pointFunc = (particle: BABYLON.CloudPoint) => {
        if (pcs.value === null || points.value === null) return;
        const { idx } = particle;
        const point = points.value[idx];
        const [x, y, z] = point;
        pcs.value.particles[idx].position = new BABYLON.Vector3(x, y, z);

        const pointLabel = pointLabels.value === null
          ? null
          : pointLabels.value[idx];
        const color = pointLabel === null ? '#FFFFFF' : label2color.value(pointLabel);
        pcs.value.particles[idx].color = BABYLON.Color4.FromColor3(
          BABYLON.Color3.FromHexString(color),
        );
      };
      pcs.value.addPoints(points.value.length, pointFunc);
      pcs.value.buildMeshAsync();
    };

    const project = (point: BABYLON.Vector3): BABYLON.Vector2 | null => {
      if (camera === null || engine === null) return null;
      const viewport = camera.viewport.toGlobal(
        engine.getRenderWidth(),
        engine.getRenderHeight(),
      );
      const vector = BABYLON.Vector3.Project(
        point,
        BABYLON.Matrix.Identity(),
        camera.getTransformationMatrix(),
        viewport,
      );
      return new BABYLON.Vector2(vector.x, vector.y);
    };

    onMounted(render);
    watch(dataObject, render);

    // Rerender on resize, otherwise the canvas would only be trivially scaled in pixel space.
    useResizeObserver(container, () => engine?.resize());

    return {
      container,
      canvas,
      pcs,
      points,
      pointLabels,
      project,
    };
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
