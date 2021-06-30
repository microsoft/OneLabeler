import { color as d3color } from 'd3';
import { Ref } from '@vue/composition-api';
import { Category } from '@/commons/types';

const useColor = (label2color: Ref<(category: Category) => string>) => {
  const getColorByCategory = (category: Category): string => {
    const color = d3color(label2color.value(category));
    if (color === null) return 'black';
    const { r, g, b } = color.rgb();
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  };

  return {
    getColorByCategory,
  };
};

export default useColor;
