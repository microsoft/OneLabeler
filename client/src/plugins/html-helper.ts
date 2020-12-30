/**
 * toolkit of misc functions
 * @namespace
 * @requires jquery
 * @requires d3
 */

import * as d3 from 'd3';
import $ from 'jquery';

/**
 * get width (in pixel) of an arbitrary html element
 * @param {HTMLElement} ele an html element
 * @returns {Number} width
 */
export const getWidth = function getWidth(ele: HTMLElement): number {
  const attrWidth = +d3.select(ele).attr('width');
  const styleWidth = $(ele).width();
  return (styleWidth === 0 || styleWidth === undefined) ? attrWidth : styleWidth;
};

/**
 * get height (in pixel) of an arbitrary html element
 * @param {HTMLElement} ele an html element
 * @returns {Number} height
 */
export const getHeight = function getHeight(ele: HTMLElement): number {
  const attrHeight = +d3.select(ele).attr('height');
  const styleHeight = $(ele).height();
  return (styleHeight === 0 || styleHeight === undefined) ? attrHeight : styleHeight;
};
