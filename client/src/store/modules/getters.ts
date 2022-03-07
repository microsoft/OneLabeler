import {
  scaleOrdinal,
  schemeCategory10,
} from 'd3';
import type { Category } from '@/commons/types';
import type { IState } from './state';

export const categories = (
  state: IState,
): Category[] => {
  const { categoryTasks } = state;
  return Object.keys(categoryTasks);
};

const schemeCategory20: string[] = [
  '#1f77b4',
  '#aec7e8',
  '#ff7f0e',
  '#ffbb78',
  '#2ca02c',
  '#98df8a',
  '#d62728',
  '#ff9896',
  '#9467bd',
  '#c5b0d5',
  '#8c564b',
  '#c49c94',
  '#e377c2',
  '#f7b6d2',
  '#7f7f7f',
  '#c7c7c7',
  '#bcbd22',
  '#dbdb8d',
  '#17becf',
  '#9edae5',
];

type Mapper = (category: string) => string;

/** The color scale for labels used in the system.  */
export const label2color = (
  state: IState,
): Mapper => {
  const categoriesValue = categories(state);
  const { unlabeledMark, colorMapper } = state;
  const scheme = categoriesValue.length <= 9 ? schemeCategory10 : schemeCategory20;

  const scale = scaleOrdinal(['#bbbbbb', ...scheme])
    .domain([unlabeledMark, ...categoriesValue]);
  const mapper = (category: string): string => {
    if (category in colorMapper) return colorMapper[category];
    return scale(category);
  };
  return mapper;
};
