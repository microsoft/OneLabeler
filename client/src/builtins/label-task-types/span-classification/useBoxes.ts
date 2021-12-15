import type { Ref } from '@vue/composition-api';
import type { ILabelTextSpan } from '@/commons/types';
import type { Box } from './types';

type UseBoxesReturn = () => Box[];

/** Compute the boxes to render for the span annotations. */
const useBoxes = (
  labelSpans: Ref<ILabelTextSpan[] | null>,
  getTextNode: Ref<() => Text>,
  container: Ref<HTMLElement | null>,
): UseBoxesReturn => {
  // Implementation note: boxes depend on the rendering result of the text.
  // Thus it should not be a computed property,
  // as the HTML may not be updated when computed properties are computed.

  const getBoxes = (): Box[] => {
    if (labelSpans.value === null || container.value === null) return [];

    const textNode = getTextNode.value();
    const boundingBox = container.value.getBoundingClientRect();

    const boxes = labelSpans.value
      .filter((span: ILabelTextSpan) => span.end < textNode.length)
      .reduce((acc: Box[], span: ILabelTextSpan) => {
        const range = document.createRange();
        range.setStart(textNode, span.start);
        range.setEnd(textNode, span.end);

        // Do not plot the spans outside the viewport.
        const rects = [...range.getClientRects()]
          .filter((rect) => (
            rect.top <= boundingBox.bottom
            && rect.bottom >= boundingBox.top
            && rect.left <= boundingBox.right
            && rect.right >= boundingBox.left
          ));

        // Clip the spans to fit inside the viewport.
        return acc.concat(rects.map((d) => ({
          top: Math.max(d.top, boundingBox.top),
          bottom: Math.min(d.bottom, boundingBox.bottom),
          left: Math.max(d.left, boundingBox.left),
          right: Math.min(d.right, boundingBox.right),
          span,
        })));
      }, []);
    return boxes;
  };

  return getBoxes;
};

export default useBoxes;
