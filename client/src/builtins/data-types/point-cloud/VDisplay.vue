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
import * as BABYLON from 'babylonjs';
import { IPointCloud, Vector3d } from '@/commons/types';
import useResizeObserver from '@/components/composables/useResizeObserver';

export default defineComponent({
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
  setup(props) {
    const { dataObject, width, height } = toRefs(props);

    const container: Ref<HTMLElement | null> = ref(null);
    const canvas: Ref<HTMLCanvasElement | null> = ref(null);

    const points: ComputedRef<Vector3d[] | null> = computed(() => {
      if (dataObject.value === null) return null;
      return dataObject.value.content;
    });
    const widthStr: ComputedRef<string> = computed((): string => {
      if (typeof width.value === 'number') return `${width.value}px`;
      return width.value;
    });
    const heightStr: ComputedRef<string> = computed((): string => {
      if (typeof height.value === 'number') return `${height.value}px`;
      return height.value;
    });

    const render = (): void => {
      if (points.value === null) return;
      if (canvas.value === null) return;

      canvas.value.style.width = widthStr.value;
      canvas.value.style.height = heightStr.value;

      const engine = new BABYLON.Engine(canvas.value);
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
        if (points.value === null) return;
        const { idx } = particle;
        const point = points.value[idx];
        const [x, y, z] = point;
        pcs.particles[idx].position = new BABYLON.Vector3(x, y, z);
        pcs.particles[idx].color = cloudColor;
      };
      pcs.addPoints(points.value.length, pointFunc);
      pcs.buildMeshAsync();
    };

    onMounted(render);
    watch(width, render);
    watch(height, render);
    useResizeObserver(container, render);

    return {
      container,
      canvas,
      widthStr,
      heightStr,
    };
  },
});
</script>
