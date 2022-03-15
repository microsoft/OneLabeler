<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

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

    <!-- Expose getPoints2d to label task overlay. -->
    <slot
      name="overlay"
      :get-points2d="getPoints2d"
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
  onUnmounted,
  watch,
  ComputedRef,
  PropType,
  Ref,
} from '@vue/composition-api';
import * as BABYLON from 'babylonjs';
import { useResizeObserver } from '@vueuse/core';
import type {
  ILabel,
  IPointCloud,
  Vector3d,
} from '@/commons/types';
import usePointColors from './usePointColors';
import useGetPoints2d from './useGetPoints2d';
import createPointCloudSystem from './createPointCloudSystem';

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
  name: 'BaseDisplaySingleView',
  props: {
    /** The data object to be rendered. */
    dataObject: {
      type: Object as PropType<IPointCloud>,
      required: true,
    },
    /** The data label. */
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
    const canvas: Ref<HTMLCanvasElement | null> = ref(null);

    const engine: BABYLON.Engine = new BABYLON.Engine(
      document.createElement('canvas'),
    );
    let scene: BABYLON.Scene | null = null;
    const camera: Ref<BABYLON.ArcRotateCamera | null> = ref(null);
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

    // Reset the rotation and position of the camera.
    const resetCameraState = () => {
      if (camera.value === null) return;
      camera.value.alpha = 0;
      camera.value.beta = 0;
      camera.value.radius = 2;
      camera.value.setPosition(new BABYLON.Vector3(2, 0, 0));
      camera.value.setTarget(BABYLON.Vector3.Zero());
    };

    // Create new scene (clear the previous scene if exist),
    // and register the canvas and camera to the engine and scene.
    const registerView = (): void => {
      // Set engine.
      engine.inputElement = canvas.value;
      engine.runRenderLoop(() => {
        if (scene?.activeCamera) scene.render();
      });

      // Dispose and set scene.
      scene?.dispose();
      scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0.8, 0.8, 0.8, 1.0);

      // Set camera and register canvas.
      if (canvas.value !== null) {
        camera.value = new BABYLON.ArcRotateCamera(
          'camera',
          0,
          0,
          2,
          BABYLON.Vector3.Zero(),
          scene,
        );
        engine.registerView(canvas.value);

        resetCameraState();

        // Configure main camera interaction.
        camera.value.wheelPrecision = 40;
        camera.value.lowerRadiusLimit = 2;
        camera.value.upperRadiusLimit = 5;
        camera.value.attachControl(canvas, true);
      }
    };

    onMounted(() => {
      registerView();
      setPointCloud();
    });
    onUnmounted(() => engine.dispose());

    // Given new data object, Rerender point cloud and reset the camera.
    watch(dataObject, () => {
      setPointCloud();
      resetCameraState();
    });

    // Use engine.resize, otherwise the canvas would be scaled in pixel space.
    useResizeObserver(container, () => engine?.resize());

    // Update point colors when pointLabels or label2color changes.
    usePointColors(pcs, pointLabels, label2color);

    // Get the getter of 2d position of points on screen.
    const { getPoints2d } = useGetPoints2d(points, camera, canvas);

    return {
      container,
      canvas,
      getPoints2d,
    };
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
