<template>
  <g
    :text-anchor="
      orient === Orient.Right
        ? 'start'
        : (orient === Orient.Left
          ? 'end'
          : 'middle')
    "
    fill="none"
    font-size="10"
    font-family="sans-serif"
  >
    <slot />
    <path
      v-if="showTickOuter"
      :d="
        orient === Orient.Left || orient === Orient.Right
          ? (tickSizeOuter
            ? `M${k * tickSizeOuter},${range0}H${offset}V${range1}H${k * tickSizeOuter}`
            : `M${offset},${range0}V${range1}`)
          : (tickSizeOuter
            ? `M${range0},${k * tickSizeOuter}V${offset}H${range1}V${k * tickSizeOuter}`
            : `M${range0},${offset}H${range1}`)
      "
      class="domain"
      stroke="currentColor"
    />
    <g
      v-for="(value, i) in values"
      :key="i"
      :transform="transform(position(value) + offset)"
      class="tick"
      opacity="1"
    >
      <line
        :[`${x}2`]="k * tickSizeInner"
        stroke="currentColor"
      />
      <text
        :[x]="k * spacing"
        :dy="
          orient === Orient.Top
            ? '0em'
            : (orient === Orient.Bottom
              ? '0.71em'
              : '0.32em')
        "
        fill="currentColor"
      >
        {{ format(value) }}
      </text>
    </g>
  </g>
</template>

<script lang="ts">
import { PropType } from 'vue';
import type {
  NumberValue,
  ScaleContinuousNumeric,
  ScaleIdentity,
  ScaleTime,
  ScaleSequentialBase,
  ScaleDiverging,
  ScaleQuantize,
  ScaleQuantile,
  ScaleThreshold,
  ScaleOrdinal,
  ScaleBand,
  ScalePoint,
} from 'd3';

type Scale<Domain extends number | string | Date, Range, Output, Unknown = never> =
  ScaleContinuousNumeric<Range, Output, Unknown>
  | ScaleIdentity<Unknown>
  | ScaleTime<Range, Output, Unknown>
  | ScaleSequentialBase<Output, Unknown>
  | ScaleDiverging<Output, Unknown>
  | ScaleQuantize<Range, Unknown>
  | ScaleQuantile<Range, Unknown>
  | ScaleThreshold<Domain, Range, Unknown>
  | ScaleOrdinal<Domain, Range, Unknown>
  | ScaleBand<Domain>
  | ScalePoint<Domain>
type UnknownScale = Scale<number | string | Date, unknown, unknown>;

// reference: https://github.com/d3/d3-axis/blob/main/src/axis.js

export enum Orient {
  Top = 1,
  Right = 2,
  Bottom = 3,
  Left = 4,
}

const translateX = (x: number): string => `translate(${x},0)`;
const translateY = (y: number): string => `translate(0,${y})`;
const identity = (x: string) => x;
const number = (
  scale: Scale<number | string | Date, [number, number], number>,
) => ((d: NumberValue & (number | string | Date)): number => (
  +(scale(d) as number | string))
);
const center = (scale: ScaleBand<unknown> | ScalePoint<unknown>, offset: number) => {
  let offsetUpdated = offset;
  offsetUpdated = Math.max(0, scale.bandwidth() - offset * 2) / 2;
  if (scale.round()) offsetUpdated = Math.round(offset);
  return (d: unknown): number => +scale(d) + offsetUpdated;
};

export default {
  name: 'VAxis',
  props: {
    /** The axis orientation. */
    orient: {
      type: Number as PropType<Orient>,
      required: true,
    },
    /** The axis scale. */
    scale: {
      type: Function as PropType<UnknownScale>,
      required: true,
    },
    /** The tick arguments. */
    tickArguments: {
      type: Array as PropType<unknown[]>,
      default: () => [],
    },
    /** The inner tick size. */
    tickSizeInner: {
      type: Number as PropType<number>,
      default: 6,
    },
    /** The outer tick size. */
    tickSizeOuter: {
      type: Number as PropType<number>,
      default: 6,
    },
    /** The tick format function. */
    tickFormat: {
      type: Function as PropType<(d: string, i: number) => string | null>,
      default: null,
    },
    /** Whether to plot the outer tick showing extent of scale's domain. */
    showTickOuter: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  },
  data() {
    const { orient } = this;
    return {
      Orient,
      tickValues: null as unknown[] | null,
      tickPadding: 3,
      offset: typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 0 : 0.5,
      k: orient === Orient.Top || orient === Orient.Left ? -1 : 1,
      x: orient === Orient.Left || orient === Orient.Right ? 'x' : 'y',
      transform: orient === Orient.Top || orient === Orient.Bottom ? translateX : translateY,
    };
  },
  computed: {
    values(): unknown[] {
      const { tickValues } = this;
      if (tickValues !== null && tickValues !== undefined) return tickValues;
      const ticks = this.scale?.ticks;
      if (ticks !== null && ticks !== undefined) return ticks(...this.tickArguments);
      return this.scale.domain();
    },
    format(): (d: string, i: number) => string {
      let { tickFormat } = this;
      if (tickFormat !== null && tickFormat !== undefined) return tickFormat;
      tickFormat = this.scale?.tickFormat;
      if (tickFormat !== null && tickFormat !== undefined) return tickFormat(...this.tickArguments);
      return identity;
    },
    spacing(): number {
      return Math.max(this.tickSizeInner, 0) + this.tickPadding;
    },
    range() {
      return this.scale.range();
    },
    range0(): number {
      return +this.range[0] + this.offset;
    },
    range1(): number {
      return +this.range[this.range.length - 1] + this.offset;
    },
    position(): ((d: unknown) => number) {
      const { scale, offset } = this;
      if (scale.bandwidth) return center(scale.copy(), offset);
      return number(scale.copy());
    },
  },
};
</script>
