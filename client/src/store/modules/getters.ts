import {
  scaleOrdinal,
  schemeCategory10,
} from 'd3';
import type { IState } from './state';

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
// eslint-disable-next-line import/prefer-default-export
export const label2color = (
  state: IState,
): Mapper => {
  const { classes, unlabeledMark, colorMapper } = state;
  const scheme = classes.length <= 9 ? schemeCategory10 : schemeCategory20;

  const scale = scaleOrdinal(['#bbbbbb', ...scheme])
    .domain([unlabeledMark, ...classes]);
  const mapper = (category: string): string => {
    if (category in colorMapper) return colorMapper[category];
    return scale(category);
  };
  return mapper;
};
