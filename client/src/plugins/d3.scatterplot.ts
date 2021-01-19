import * as d3 from 'd3';

type NumberAccessor = (() => number)
  | ((d: unknown) => number)
  | ((d: unknown, i: number) => number);
type ColorStringAccessor = (() => number)
  | ((d: unknown) => string)
  | ((d: unknown, i: number) => string);
type Margin = { top: number, right: number, bottom: number, left: number };
type Axis = { label: string, tickNum: number | null };
type Data = Record<string | number, unknown>[];

export interface IScatterplot {
  /** Get display area width. */
  width(): number;
  /** Set display area width. */
  width(value: number): this;

  /** Get display area height. */
  height(): number;
  /** Set display area height. */
  height(value: number): this;

  /** Get margin to display area border. */
  margin(): Required<Margin>;
  /** Set margin to display area border. */
  margin(value: Partial<Margin>): this;

  /** Get animation transition duration. */
  duration(): number;
  /** Set animation transition duration. */
  duration(value: number): this;

  /** Get x-axis configuration. */
  xAxis(): Required<Axis> | null;
  /** Set x-axis configuration. */
  xAxis(value: Partial<Axis> | null): this;

  /** Get y-axis configuration. */
  yAxis(): Required<Axis> | null;
  /** Set y-axis configuration. */
  yAxis(value: Partial<Axis> | null): this;

  /** Get accessor to numbers mapped to x positions. */
  xAccessor(): NumberAccessor;
  /** Set accessor to numbers mapped to x positions. */
  xAccessor(value: NumberAccessor): this;

  /** Get accessor to numbers mapped to y positions. */
  yAccessor(): NumberAccessor;
  /** Set accessor to numbers mapped to y positions. */
  yAccessor(value: NumberAccessor): this;

  /** Get accessor to radiuses of the scatter dots. */
  rAccessor(): NumberAccessor;
  /** Set accessor to radiuses of the scatter dots. */
  rAccessor(value: NumberAccessor): this;

  /** Get accessor to filling colors of the scatter dots. */
  fillAccessor(): ColorStringAccessor;
  /** Set accessor to filling colors of the scatter dots. */
  fillAccessor(value: ColorStringAccessor): this;

  /** Get accessor to stroke colors of the scatter dots. */
  strokeAccessor(): ColorStringAccessor;
  /** Set accessor to stroke colors of the scatter dots. */
  strokeAccessor(value: ColorStringAccessor): this;

  /** Render/Update a scatterplot with the data on the root element. */
  render<T extends SVGSVGElement | SVGGElement>(root: T, data: Data): void | Promise<void>;
}

export default class Scatterplot implements IScatterplot {
  #width = 400;

  #height = 400;

  #margin: Required<Margin> = {
    top: 50, right: 50, bottom: 50, left: 50,
  };

  #duration = 500;

  #xAxis: Required<Axis> | null = { label: 'x', tickNum: null };

  #yAxis: Required<Axis> | null = { label: 'y', tickNum: null };

  #xAccessor: NumberAccessor = (d: unknown) => (d as { x: number }).x;

  #yAccessor: NumberAccessor = (d: unknown) => (d as { y: number }).y;

  #rAccessor: NumberAccessor = () => 3;

  #fillAccessor: ColorStringAccessor = () => '#ff7f0e';

  #strokeAccessor: ColorStringAccessor = () => '#bbbbbb';

  width(): number;

  width(value: number): this;

  width(value?: number): number | this {
    if (value === undefined) return this.#width;
    this.#width = value;
    return this;
  }

  height(): number;

  height(value: number): this;

  height(value?: number): number | this {
    if (value === undefined) return this.#height;
    this.#height = value;
    return this;
  }

  margin(): Required<Margin>;

  margin(value: Partial<Margin>): this;

  margin(value?: Partial<Margin>): Required<Margin> | this {
    if (value === undefined) return this.#margin;
    if ('top' in value) {
      this.#margin.top = value.top as number;
    }
    if ('right' in value) {
      this.#margin.right = value.right as number;
    }
    if ('bottom' in value) {
      this.#margin.bottom = value.bottom as number;
    }
    if ('left' in value) {
      this.#margin.left = value.left as number;
    }
    return this;
  }

  duration(): number;

  duration(value: number): this;

  duration(value?: number): number | this {
    if (value === undefined) return this.#duration;
    this.#duration = value;
    return this;
  }

  xAxis(): Required<Axis> | null;

  xAxis(value: Partial<Axis> | null): this;

  xAxis(value?: Partial<Axis> | null): (Partial<Axis> | null) | this {
    if (value === undefined) return this.#xAxis;
    if (value === null) {
      this.#xAxis = value;
    } else {
      if (this.#xAxis === null) {
        this.#xAxis = { label: 'x', tickNum: null };
      }
      if ('label' in value) {
        this.#xAxis.label = value.label as string;
      }
      if ('tickNum' in value) {
        this.#xAxis.tickNum = value.tickNum as number;
      }
    }
    return this;
  }

  yAxis(): Required<Axis> | null;

  yAxis(value: Partial<Axis> | null): this;

  yAxis(value?: Partial<Axis> | null): (Partial<Axis> | null) | this {
    if (value === undefined) return this.#yAxis;
    if (value === null) {
      this.#yAxis = value;
    } else {
      if (this.#yAxis === null) {
        this.#yAxis = { label: 'x', tickNum: null };
      }
      if ('label' in value) {
        this.#yAxis.label = value.label as string;
      }
      if ('tickNum' in value) {
        this.#yAxis.tickNum = value.tickNum as number;
      }
    }
    return this;
  }

  xAccessor(): NumberAccessor;

  xAccessor(value: NumberAccessor): this;

  xAccessor(value?: NumberAccessor): NumberAccessor | this {
    if (value === undefined) return this.#xAccessor;
    this.#xAccessor = value;
    return this;
  }

  yAccessor(): NumberAccessor;

  yAccessor(value: NumberAccessor): this;

  yAccessor(value?: NumberAccessor): NumberAccessor | this {
    if (value === undefined) return this.#yAccessor;
    this.#yAccessor = value;
    return this;
  }

  rAccessor(): NumberAccessor;

  rAccessor(value: NumberAccessor): this;

  rAccessor(value?: NumberAccessor): NumberAccessor | this {
    if (value === undefined) return this.#rAccessor;
    this.#rAccessor = value;
    return this;
  }

  fillAccessor(): ColorStringAccessor;

  fillAccessor(value: ColorStringAccessor): this;

  fillAccessor(value?: ColorStringAccessor): ColorStringAccessor | this {
    if (value === undefined) return this.#fillAccessor;
    this.#fillAccessor = value;
    return this;
  }

  strokeAccessor(): ColorStringAccessor;

  strokeAccessor(value: ColorStringAccessor): this;

  strokeAccessor(value?: ColorStringAccessor): ColorStringAccessor | this {
    if (value === undefined) return this.#strokeAccessor;
    this.#strokeAccessor = value;
    return this;
  }

  render<T extends SVGSVGElement | SVGGElement>(root: T, data: Data): Promise<void> {
    const width = this.#width;
    const height = this.#height;
    const margin = this.#margin;
    const duration = this.#duration;
    const xAxisSettings = this.#xAxis;
    const yAxisSettings = this.#yAxis;
    const xAccessor = this.#xAccessor;
    const yAccessor = this.#yAccessor;
    const rAccessor = this.#rAccessor;
    const fillAccessor = this.#fillAccessor;
    const strokeAccessor = this.#strokeAccessor;

    const classContainer = 'container';
    const classX = 'x';
    const classY = 'y';
    const classAxis = 'axis';
    const classLabel = 'label';
    const classDot = 'dot';

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleLinear().range([0, innerWidth]);
    const xExtent = d3.extent(data, xAccessor) as [number, number];
    x.domain(xExtent).nice();
    const y = d3.scaleLinear().range([innerHeight, 0]);
    const yExtent = d3.extent(data, yAccessor) as [number, number];
    y.domain(yExtent).nice();

    // Draw a container:
    // Create a g for the container if doesn't exist.
    d3.select<T, unknown>(root)
      .selectAll<SVGGElement, null>(`.${classContainer}`)
      .data([null])
      .enter()
      .append<SVGGElement>('g')
      .attr('class', classContainer);
    const g = d3.select<T, unknown>(root)
      .selectAll<SVGGElement, null>(`.${classContainer}`);
    // Apply attribute to the container's g
    // (no matter newly created or not).
    g.transition()
      .duration(duration)
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (xAxisSettings !== null) {
      const { label, tickNum } = xAxisSettings;

      // Draw an x-axis:
      const xAxis = d3.axisBottom(x);
      if (tickNum !== null) xAxis.ticks(tickNum);
      // Create a g for the x-axis if doesn't exist.
      g.selectAll<SVGGElement, null>(`.${classX}.${classAxis}`)
        .data([null])
        .enter()
        .append<SVGGElement>('g')
        .attr('class', `${classX} ${classAxis}`);
      const gx = g.selectAll<SVGGElement, null>(`.${classX}.${classAxis}`);
      // Apply attribute and draw x-axis its g
      // (no matter newly created or not).
      gx.transition()
        .duration(duration)
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis);

      // Draw text to the x-axis:
      // Create a g for the x-axis-text if doesn't exist.
      gx.selectAll<SVGTextElement, null>(`.${classX}.${classLabel}`)
        .data([null])
        .enter()
        .append<SVGTextElement>('text')
        .attr('class', `${classX} ${classLabel}`);
      // Apply attribute and draw x-axis-text its g
      // (no matter newly created or not).
      gx.selectAll<SVGTextElement, null>(`.${classX}.${classLabel}`)
        .attr('dy', '2.5em')
        .attr('dx', '0em')
        .attr('x', innerWidth)
        .attr('fill', 'black')
        .style('font', '10px sans-serif')
        .text(label);
    } else {
      // Delete the x-axis.
      g.selectAll<SVGGElement, null>(`.${classX}.${classAxis}`)
        .data([])
        .exit()
        .remove();
    }

    if (yAxisSettings !== null) {
      const { label, tickNum } = yAxisSettings;

      // Draw a y-axis:
      const yAxis = d3.axisLeft(y);
      if (tickNum !== null) yAxis.ticks(tickNum);
      // Create a g for the y-axis if doesn't exist.
      g.selectAll<SVGGElement, null>(`.${classY}.${classAxis}`)
        .data([null])
        .enter()
        .append<SVGGElement>('g')
        .attr('class', `${classY} ${classAxis}`);
      const gy = g.selectAll<SVGGElement, null>(`.${classY}.${classAxis}`);
      // Apply attribute and draw y-axis its g
      // (no matter newly created or not).
      gy.transition()
        .duration(duration)
        .call(yAxis);

      // Draw text to the y-axis:
      // Create a g for the y-axis-text if doesn't exist.
      gy.selectAll<SVGTextElement, null>(`.${classY}.${classLabel}`)
        .data([null])
        .enter()
        .append<SVGTextElement>('text')
        .attr('class', `${classY} ${classLabel}`);
      // Apply attribute and draw y-axis-text its g
      // (no matter newly created or not).
      gy.selectAll<SVGTextElement, null>(`.${classY}.${classLabel}`)
        .attr('transform', 'rotate(-90)')
        .attr('dy', '-3.5em')
        .attr('fill', 'black')
        .style('font', '10px sans-serif')
        .text(label);
    } else {
      // Delete the y-axis.
      g.selectAll<SVGGElement, null>(`.${classY}.${classAxis}`)
        .data([])
        .exit()
        .remove();
    }

    // Draw scatter dots:
    const dots = g.selectAll<SVGCircleElement, Data>(`.${classDot}`)
      .data(data);
    dots.enter()
      .append('circle')
      .attr('class', classDot);
    dots.exit().remove();

    const transition = g.selectAll<SVGCircleElement, Data>(`.${classDot}`)
      .transition()
      .duration(duration)
      .attr('r', rAccessor)
      .attr('cx', (d, i) => x(xAccessor(d, i)))
      .attr('cy', (d, i) => y(yAccessor(d, i)))
      .style('fill', fillAccessor)
      .style('stroke', strokeAccessor)
      .style('stroke-width', '1px');
    return transition.end();
  }
}
