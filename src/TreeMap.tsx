import * as d3 from 'd3';
import React, {useRef, useEffect, useState} from 'react';
import {HierarchyNode} from "d3";

export interface Identifier {
  name: string,
  group: string
}

interface Leaf extends Identifier {
  value: number;
  hasChanges: boolean;
}

interface InnerData {
  name: string;
  children: Leaf[]
}

export interface HierarchyData {
  children: InnerData[]
}

interface TreeMapProps {
  hierarchyData: HierarchyData;
  selected: Identifier | undefined;
  setSelected: (data: Leaf | undefined) => void;
  colours: string[];
}

export const TreeMap = ({hierarchyData, selected, setSelected, colours}: TreeMapProps) => {
  const ref = useRef<SVGSVGElement>(null);

  const height = 400;

  useEffect(() => {
    d3.select(ref.current)
    .attr("width", "100%")
    .attr("height", height);

    // @ts-ignore
    module.hot?.dispose(() => {
      draw();
    });

    window.addEventListener(
      "resize",
      () => draw()
    );
  }, []);

  const draw = () => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    // Give the data to this cluster layout:
    const root = d3.hierarchy(hierarchyData).sum(function (d) {
      // @ts-ignore
      return d.value
    });

    const width = ref.current?.clientWidth || height

    // initialize treemap
    d3.treemap()
    .size([width, height])
    .paddingTop(28)
    .paddingRight(7)
    .paddingInner(3)
    (root);

    const color = d3.scaleOrdinal().range(colours);

    // Select the nodes
    const nodes = svg
    .selectAll("rect")
    .data(root.leaves() as unknown as HierarchyNode<Leaf>[])

    // draw rectangles
    nodes.enter()
    .append("rect")
    .attr('x', function (d) { // @ts-ignore
      return d.x0;
    })
    .attr('y', function (d) { // @ts-ignore
      return d.y0;
    })
    .attr('width', function (d) { // @ts-ignore
      return d.x1 - d.x0;
    })
    .attr('height', function (d) { // @ts-ignore
      return d.y1 - d.y0;
    })
    // @ts-ignore
    .style("fill", function (d) { // @ts-ignore
      return selected && selected.group === d.data.group && selected.name === d.data.name ? "magenta" : color(d.parent.data.name)
    })
    .style("cursor", "pointer");

    nodes.exit().remove();

    // select node titles
    const nodeText = svg
    .selectAll("text")
    .data(root.leaves())

    // add the text
    nodeText.enter()
    .append("foreignObject")
    .attr("x", function (d) { // @ts-ignore
      return d.x0
    })
    .attr("y", function (d) { // @ts-ignore
      return d.y0
    })
    .attr('width', function (d) { // @ts-ignore
      return d.x1 - d.x0;
    })
    .attr('height', function (d) { // @ts-ignore
      return d.y1 - d.y0;
    })
    .on("click", (_, {data}) => {
      setSelected(
        // @ts-ignore
        selected?.group === data.group && selected?.name === data.name
          ? undefined
          : data);
    })
    .append("xhtml:div")
    .attr("class", "text")
    .text(function (d) { // @ts-ignore
      return `${d.data.hasChanges ? "**" : ""}${d.data.name}`
    })
    .append("div")
    .text(function (d) { // @ts-ignore
      return `£${(d.data.value/1_000).toFixed(1)}bill`
    })

    // select node titles
    const nodeVals = svg
    .selectAll("vals")
    .data(root.leaves())

    // add the parent node titles
    svg
    .selectAll("titles")
    .data(root.descendants().filter(function (d) {
      return d.depth == 1
    }))
    .enter()
    .append("text")
    .attr("x", function (d) { // @ts-ignore
      return d.x0
    })
    .attr("y", function (d) { // @ts-ignore
      return d.y0 + 21
    })
    .text(function (d) { // @ts-ignore
      return d.data.name
    })
    .attr("font-size", "12px")
    // @ts-ignore
    .attr("fill", function (d) { // @ts-ignore
      return color(d.data.name)
    })
    .style("font-weight", "bold")
  }

  useEffect(draw, [hierarchyData, selected]);

  return (
    <div style={{padding: "10px"}}>
      <svg ref={ref}>
      </svg>
    </div>

  )
}
