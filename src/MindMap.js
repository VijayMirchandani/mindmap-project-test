import React, { useEffect, useState } from "react";
import * as d3 from "d3";

const MindMap = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/mindmap.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load mindmap.json");
        }
        return response.json();
      })
      .then((jsonData) => {
        setData(jsonData);
        drawMindMap(jsonData);
      })
      .catch((error) => console.error("Error loading mindmap.json:", error));
  }, []);

  const drawMindMap = (treeData) => {
    if (!treeData) return;

    const width = window.innerWidth * 0.95;
    const height = window.innerHeight * 0.9;

    d3.select("#mindmap").selectAll("*").remove();

    const svg = d3
      .select("#mindmap")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(
        d3.zoom().on("zoom", (event) => {
          svgGroup.attr("transform", event.transform);
        })
      )
      .append("g");

    const svgGroup = svg.append("g").attr("transform", "translate(50,50)");

    const treeLayout = d3.tree().size([width - 300, height - 200]);
    const root = d3.hierarchy(treeData);

    treeLayout(root);

    // Create links
    const link = svgGroup
      .selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#999")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .linkVertical()
          .x((d) => d.x)
          .y((d) => d.y)
      );

    // Create nodes
    const node = svgGroup
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .on("click", (event, d) => {
        d.children = d.children ? null : d._children;
        drawMindMap(treeData); // Refresh map on collapse/expand
      });

    // Add circles to nodes with gradient effect
    node
      .append("circle")
      .attr("r", 14)
      .attr("fill", (d) => (d.children ? "#0077cc" : "#ff5733"))
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("filter", "url(#drop-shadow)");

    // Add text labels
    node
      .append("text")
      .attr("dy", (d) => (d.children ? -20 : 15))
      .attr("dx", (d) => (d.children ? 0 : 10))
      .attr("text-anchor", "middle")
      .text((d) => d.data.name)
      .style("fill", "#333")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .attr("transform", (d) => `rotate(${d.children ? 0 : 20})`);

    // Add tooltip
    node.append("title").text((d) => `Click to expand/collapse: ${d.data.name}`);

    // Add drop shadow effect
    svg
      .append("defs")
      .append("filter")
      .attr("id", "drop-shadow")
      .append("feDropShadow")
      .attr("dx", 2)
      .attr("dy", 2)
      .attr("stdDeviation", 2);
  };

  return <div id="mindmap" style={{ textAlign: "center", padding: "20px" }}></div>;
};

export default MindMap;
