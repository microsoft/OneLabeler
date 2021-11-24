import {
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  Ref,
} from '@vue/composition-api';

/**
 * Bind resizeObserver to the element.
 * @note ResizeObserver cannot observe svg
 * according to W3C specification as of 2021.10.25.
 */
export const useResizeObserver = (
  element: Ref<HTMLElement | null>,
  onResize: () => void,
): void => {
  const resizeObserver = new ResizeObserver(() => onResize());
  onMounted(() => {
    if (element.value !== null) resizeObserver.observe(element.value);
    onResize();
  });
  onBeforeUnmount(() => resizeObserver.disconnect());
};

/** Get continuously updated element size. */
export const useElementSize = (element: Ref<HTMLElement | null>) => {
  const width: Ref<number | null> = ref(null);
  const height: Ref<number | null> = ref(null);

  // Store the size of the element.
  const getSize = (): void => {
    if (element.value === null) return;
    width.value = element.value.clientWidth;
    height.value = element.value.clientHeight;
  };

  useResizeObserver(element, getSize);
  onUpdated(getSize);
  onMounted(getSize);

  return { width, height };
};
