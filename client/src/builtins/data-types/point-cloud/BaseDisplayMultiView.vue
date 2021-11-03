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

      <!-- Expose getPoints2d to label task overlay. -->
      <slot
        name="overlay"
        :get-points2d="getPoints2d"
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
  onUnmounted,
  watch,
  ComputedRef,
  PropType,
  Ref,
} from '@vue/composition-api';
import * as BABYLON from 'babylonjs';
import {
  ILabel,
  IPointCloud,
  Vector3d,
} from '@/commons/types';
import useResizeObserver from '@/components/composables/useResizeObserver';
import usePointColors from './usePointColors';
import useGetPoints2d from './useGetPoints2d';
import createPointCloudSystem from './createPointCloudSystem';

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
  name: 'BaseDisplay',
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
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
    },
  },
  setup(props) {
    const { dataObject, label, label2color } = toRefs(props);

    const container: Ref<HTMLElement | null> = ref(null);
    const canvasMain: Ref<HTMLCanvasElement | null> = ref(null);
    const canvasTop: Ref<HTMLCanvasElement | null> = ref(null);
    const canvasFront: Ref<HTMLCanvasElement | null> = ref(null);
    const canvasLeft: Ref<HTMLCanvasElement | null> = ref(null);

    const engine: BABYLON.Engine = new BABYLON.Engine(
      document.createElement('canvas'),
    );
    let scene: BABYLON.Scene | null = null;
    const cameraMain: Ref<BABYLON.ArcRotateCamera | null> = ref(null);
    const pcs: Ref<BABYLON.PointsCloudSystem | null> = ref(null);

    const points: ComputedRef<Vector3d[] | null> = computed(() => (
      dataObject.value?.content ?? null
    ));
    const pointLabels: ComputedRef<string[] | null> = computed(() => (
      label.value?.pointLabels ?? null
    ));

    // Render the point cloud (clear the previous point cloud if exist).
    const setPointCloud = (): void => {
      // Dispose the previous point cloud system,
      // otherwise the point clouds will be superimposed.
      pcs.value?.dispose();
      pcs.value = createPointCloudSystem(
        scene,
        points.value,
        pointLabels.value,
        label2color.value,
      );
    };

    // Reset the rotation and position of the main camera.
    const resetCameraMainState = () => {
      if (cameraMain.value === null) return;
      cameraMain.value.alpha = 0;
      cameraMain.value.beta = 0;
      cameraMain.value.radius = 2;
      cameraMain.value.setPosition(new BABYLON.Vector3(2, 0, 0));
      cameraMain.value.setTarget(BABYLON.Vector3.Zero());
    };

    // Create new scene (clear the previous scene if exist),
    // and register the canvases and cameras to the engine and scene.
    const registerViews = (): void => {
      // Set engine.
      engine.inputElement = canvasMain.value;
      engine.runRenderLoop(() => {
        if (scene?.activeCamera) scene.render();
      });

      // Dispose and set scene.
      scene?.dispose();
      scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0.8, 0.8, 0.8, 1.0);

      // Set camera and register main canvas.
      if (canvasMain.value !== null) {
        cameraMain.value = new BABYLON.ArcRotateCamera(
          'cameraMain',
          0,
          0,
          2,
          BABYLON.Vector3.Zero(),
          scene,
        );
        engine.registerView(canvasMain.value);

        resetCameraMainState();

        // Configure main camera interaction.
        cameraMain.value.wheelPrecision = 40;
        cameraMain.value.lowerRadiusLimit = 2;
        cameraMain.value.upperRadiusLimit = 5;
        cameraMain.value.attachControl(null, true);
      }

      // Set camera and register top canvas.
      if (canvasTop.value !== null) {
        const cameraTop = new BABYLON.UniversalCamera(
          'cameraTop',
          new BABYLON.Vector3(0, 2, 0),
          scene,
        );
        cameraTop.setTarget(BABYLON.Vector3.Zero());
        engine.registerView(canvasTop.value, cameraTop);
      }

      // Set camera and register front canvas.
      if (canvasFront.value !== null) {
        const cameraFront = new BABYLON.UniversalCamera(
          'cameraFront',
          new BABYLON.Vector3(0, 0, -2),
          scene,
        );
        cameraFront.setTarget(BABYLON.Vector3.Zero());
        engine.registerView(canvasFront.value, cameraFront);
      }

      // Set camera and register left canvas.
      if (canvasLeft.value !== null) {
        const cameraLeft = new BABYLON.UniversalCamera(
          'cameraLeft',
          new BABYLON.Vector3(-2, 0, 0),
          scene,
        );
        cameraLeft.setTarget(BABYLON.Vector3.Zero());
        engine.registerView(canvasLeft.value, cameraLeft);
      }
    };

    onMounted(() => {
      registerViews();
      setPointCloud();
    });
    onUnmounted(() => engine.dispose());

    // Given new data object, Rerender point cloud and reset the camera.
    watch(dataObject, () => {
      setPointCloud();
      resetCameraMainState();
    });

    // Use engine.resize, otherwise the canvas would be scaled in pixel space.
    useResizeObserver(container, () => engine.resize());

    // Update point colors when pointLabels or label2color changes.
    usePointColors(pcs, pointLabels, label2color);

    // Get the getter of 2d position of points on screen.
    const { getPoints2d } = useGetPoints2d(points, cameraMain, canvasMain);

    return {
      container,
      canvasMain,
      canvasFront,
      canvasTop,
      canvasLeft,
      getPoints2d,
    };
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
