import {
  onBeforeUnmount,
  onMounted,
  Ref,
} from '@vue/composition-api';

/**
 * Bind resizeObserver to the container.
 * @note ResizeObserver cannot observe svg
 * according to W3C specification as of 2021.10.25.
 */
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
