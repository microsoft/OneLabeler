import * as d3 from 'd3';

type NumberAccessor = (() => number)
  | ((d: unknown) => number)
  | ((d: unknown, i: number) => number);
type Margin = { top: number, right: number, bottom: number, left: number };
type Axis = { label: string, tickNum: number | null };
type Datum = Record<string | number, unknown>;
type Data = Datum[];
type DatumBinned = { points: Datum[], row: number, column: number };
type DataBinned = DatumBinned[];

export interface IHeatmap {
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

  /** Get number of rows in the heatmap. */
  nRows(): number;
  /** Set number of rows in the heatmap. */
  nRows(value: number): this;

  /** Get number of columns in the heatmap. */
  nColumns(): number;
  /** Set number of columns in the heatmap. */
  nColumns(value: number): this;

  /** Get the range of numbers mapped to x positions. */
  xExtent(): [number, number] | null;
  /** Set the range of numbers mapped to x positions. */
  xExtent(value: [number, number]): this;

  /** Get the range of numbers mapped to y positions. */
  yExtent(): [number, number] | null;
  /** Set the range of numbers mapped to y positions. */
  yExtent(value: [number, number]): this;

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

  /** Render/Update a scatterplot with the data on the root element. */
  render<T extends SVGSVGElement | SVGGElement>(root: T, data: Data): void | Promise<void>;
}

const binning = (
  data: Data,
  xAccessor: NumberAccessor,
  yAccessor: NumberAccessor,
  nRows: number,
  nColumns: number,
  xExtent: [number, number],
  yExtent: [number, number],
): DataBinned => {
  const [xMin, xMax] = xExtent;
  const [yMin, yMax] = yExtent;

  // initialize 3d array of size (nRows, nColumns, 0)
  const dataBinnedMatrix: Datum[][][] = new Array(nRows).fill(null).map(() => (
    new Array(nColumns).fill(null).map(
      () => new Array(0),
    )
  ));

  data.forEach((datum: Datum, i: number) => {
    const x = xAccessor(datum, i);
    const y = yAccessor(datum, i);
    let row = Math.floor((nRows * (y - yMin)) / (yMax - yMin));
    if (row === nRows) {
      row = nRows - 1;
    }
    let column = Math.floor((nColumns * (x - xMin)) / (xMax - xMin));
    if (column === nColumns) {
      column = nColumns - 1;
    }
    dataBinnedMatrix[row][column].push(datum);
  });
  const dataBinned: { points: Datum[], row: number, column: number }[] = [];
  dataBinnedMatrix.forEach((dataRow: Datum[][], i: number) => {
    dataRow.forEach((dataCell: Datum[], j: number) => {
      dataBinned.push({
        row: i,
        column: j,
        points: dataCell,
      });
    });
  });
  return dataBinned;
};

export default class Heatmap implements IHeatmap {
  #width = 400;

  #height = 400;

  #margin: Required<Margin> = {
    top: 50, right: 50, bottom: 50, left: 50,
  };

  #duration = 500;

  #nRows = 10;

  #nColumns = 10;

  #xAxis: Required<Axis> | null = { label: 'x', tickNum: null };

  #yAxis: Required<Axis> | null = { label: 'y', tickNum: null };

  #xExtent: [number, number] | null = null;

  #yExtent: [number, number] | null = null;

  #xAccessor: NumberAccessor = (d: unknown) => (d as { x: number }).x;

  #yAccessor: NumberAccessor = (d: unknown) => (d as { y: number }).y;

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

  nRows(): number;

  nRows(value: number): this;

  nRows(value?: number): number | this {
    if (value === undefined) return this.#nRows;
    this.#nRows = value;
    return this;
  }

  nColumns(): number;

  nColumns(value: number): this;

  nColumns(value?: number): number | this {
    if (value === undefined) return this.#nColumns;
    this.#nColumns = value;
    return this;
  }

  xExtent(): [number, number] | null;

  xExtent(value: [number, number] | null): this;

  xExtent(value?: [number, number] | null): [number, number] | null | this {
    if (value === undefined) return this.#xExtent;
    this.#xExtent = value;
    return this;
  }

  yExtent(): [number, number] | null;

  yExtent(value: [number, number] | null): this;

  yExtent(value?: [number, number] | null): [number, number] | null | this {
    if (value === undefined) return this.#yExtent;
    this.#yExtent = value;
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

  render<T extends SVGSVGElement | SVGGElement>(root: T, data: Data): Promise<void> {
    const width = this.#width;
    const height = this.#height;
    const margin = this.#margin;
    const duration = this.#duration;
    let xExtent = this.#xExtent;
    let yExtent = this.#yExtent;
    const nRows = this.#nRows;
    const nColumns = this.#nColumns;
    const xAxisSettings = this.#xAxis;
    const yAxisSettings = this.#yAxis;
    const xAccessor = this.#xAccessor;
    const yAccessor = this.#yAccessor;

    const classContainer = 'container';
    const classX = 'x';
    const classY = 'y';
    const classAxis = 'axis';
    const classLabel = 'label';
    const classGrid = 'grid';

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (xExtent === null) {
      xExtent = d3.extent(data, xAccessor) as [number, number];
    }
    if (yExtent === null) {
      yExtent = d3.extent(data, yAccessor) as [number, number];
    }

    const x = d3.scaleLinear()
      .range([0, innerWidth])
      .domain(xExtent);
    const y = d3.scaleLinear()
      .range([innerHeight, 0])
      .domain(yExtent);

    const dataBinned = binning(
      data,
      xAccessor,
      yAccessor,
      nRows,
      nColumns,
      xExtent,
      yExtent,
    );

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

    // Draw heatmap rects
    const grids = g.selectAll<SVGRectElement, DatumBinned>(`.${classGrid}`)
      .data(dataBinned);
    grids.enter()
      .append('rect')
      .attr('class', classGrid);
    grids.exit().remove();

    let maxDots = 0;
    dataBinned.forEach((d) => {
      maxDots = Math.max(d.points.length, maxDots);
    });
    const color = d3.scaleLinear()
      .domain([0, maxDots])
      .range(['#ffffff', '#67000d'])
      .interpolate(d3.interpolateLab);

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
      // Apply attribute and draw x-axis on its g
      // (no matter newly created or not).
      gx.transition()
        .duration(duration)
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .attr('font-size', '8px')
        .attr('font-family', 'sans-serif');

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
        .style('font', '8px sans-serif')
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
      // Apply attribute and draw y-axis on its g
      // (no matter newly created or not).
      gy.transition()
        .duration(duration)
        .call(yAxis)
        .attr('font-size', '8px')
        .attr('font-family', 'sans-serif');

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
        .attr('dy', '-3em')
        .attr('fill', 'black')
        .style('font', '8px sans-serif')
        .text(label);
    } else {
      // Delete the y-axis.
      g.selectAll<SVGGElement, null>(`.${classY}.${classAxis}`)
        .data([])
        .exit()
        .remove();
    }

    const transition = g.selectAll<SVGRectElement, DatumBinned>(`.${classGrid}`)
      .transition()
      .duration(duration)
      .attr('width', innerWidth / nColumns)
      .attr('height', innerHeight / nRows)
      .attr('x', (d) => (innerWidth * d.column) / nColumns)
      .attr('y', (d) => (innerHeight * (nRows - 1 - d.row)) / nRows)
      .attr('fill', (d) => color(d.points.length))
      .attr('stroke', 'white')
      .attr('stroke-width', '1px');
    return transition.end();
  }
}
