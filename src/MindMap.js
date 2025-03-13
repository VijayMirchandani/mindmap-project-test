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

    const width = window.innerWidth * 0.9;
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

    const treeLayout = d3.tree().size([width - 300, height - 200]); // Increase spacing
    const root = d3.hierarchy(treeData);
    treeLayout(root);

    svgGroup
      .selectAll("line")
      .data(root.links())
      .enter()
      .append("line")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y)
      .attr("stroke", "#555")
      .attr("stroke-width", 2);

    const nodes = svgGroup
      .selectAll("g.node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`)
      .on("mouseover", function () {
        d3.select(this).select("circle").attr("fill", "#ff5733");
      })
      .on("mouseout", function () {
        d3.select(this).select("circle").attr("fill", "#0077cc");
      });

    nodes
      .append("circle")
      .attr("r", 12) // Bigger circle
      .attr("fill", "#0077cc")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    nodes
      .append("text")
      .attr("dy", (d) => (d.children ? -20 : 15)) // Adjust position
      .attr("dx", (d) => (d.children ? 0 : 10))
      .attr("text-anchor", (d) => (d.children ? "middle" : "start"))
      .text((d) => d.data.name)
      .style("fill", "#333")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("cursor", "pointer")
      .attr("transform", (d) => `rotate(${d.children ? 0 : 25})`); // Rotate leaf nodes for better spacing

    nodes
      .append("title") // Tooltip for better readability
      .text((d) => d.data.name);

    nodes.on("click", function (event, d) {
      alert(`You clicked on: ${d.data.name}`);
    });
  };

  return <div id="mindmap" style={{ textAlign: "center", padding: "20px" }}></div>;
};

export default MindMap;
