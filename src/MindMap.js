import React, { useEffect, useState } from "react";
import * as d3 from "d3";

const MindMap = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/mindmap.json")
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
        drawMindMap(jsonData);
      });
  }, []);

  const drawMindMap = (treeData) => {
    const width = 800, height = 600;
    d3.select("#mindmap").selectAll("*").remove(); // Clear previous render

    const svg = d3.select("#mindmap")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(50,50)");

    const treeLayout = d3.tree().size([width - 100, height - 100]);
    const root = d3.hierarchy(treeData);
    treeLayout(root);

    // Links
    svg.selectAll("line")
      .data(root.links())
      .enter()
      .append("line")
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)
      .attr("stroke", "#555");

    // Nodes
    const nodes = svg.selectAll("circle")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    nodes.append("circle")
      .attr("r", 8)
      .attr("fill", "#0077cc");

    nodes.append("text")
      .attr("dy", -12)
      .attr("text-anchor", "middle")
      .text(d => d.data.name)
      .style("fill", "#333")
      .style("font-size", "12px");
  };

  return <div id="mindmap"></div>;
};

export default MindMap;
