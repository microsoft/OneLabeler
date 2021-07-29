import {
  onBeforeUnmount,
  onMounted,
  Ref,
} from '@vue/composition-api';

/** Bind resizeObserver to the container. */
const useResizeObserver = (
  container: Ref<HTMLElement | null>,
  onResize: () => void,
): void => {
  const resizeObserver = new ResizeObserver(() => onResize());
  onMounted(() => {
    if (container.value !== null) resizeObserver.observe(container.value);
    onResize();
  });
  onBeforeUnmount(() => resizeObserver.disconnect());
};

export default useResizeObserver;
