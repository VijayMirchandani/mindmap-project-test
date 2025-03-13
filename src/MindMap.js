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
      })
      .catch((error) => console.error("Error loading mindmap.json:", error));
  }, []);

  const drawMindMap = (treeData) => {
    if (!treeData) return;

    const width = window.innerWidth * 0.95;
    const height = window.innerHeight * 0.9;
    const radius = Math.min(width, height) / 2 - 100;

    d3.select("#mindmap").selectAll("*").remove();

    const svg = d3
      .select("#mindmap")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "linear-gradient(120deg, #1a1a2e, #16213e)")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const cluster = d3.cluster().size([360, radius]);
    const root = d3.hierarchy(treeData);
    cluster(root);

    // Create links
    const link = svg
      .selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .linkRadial()
          .angle((d) => (d.x / 180) * Math.PI)
          .radius((d) => d.y)
      );

    // Create nodes
    const node = svg
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr(
        "transform",
        (d) => `rotate(${d.x - 90}) translate(${d.y}, 0)`
      );

    // Add circles with glow effect
    node
      .append("circle")
      .attr("r", 12)
      .attr("fill", (d) => (d.depth === 0 ? "#ffcc00" : d.depth === 1 ? "#ff5733" : "#00ccff"))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("filter", "url(#glow)");

    // Add text labels with rotation
    node
      .append("text")
      .attr("dy", ".31em")
      .attr("x", (d) => (d.x < 180 ? 15 : -15))
      .attr("text-anchor", (d) => (d.x < 180 ? "start" : "end"))
      .attr("transform", (d) => (d.x < 180 ? "" : "rotate(180)"))
      .text((d) => d.data.name)
      .style("fill", "#fff")
      .style("font-size", "14px")
      .style("font-weight", "bold");

    // Add hover tooltip bubbles
    node
      .append("title")
      .text((d) => `Info: ${d.data.name}`);

    // Add glowing effect
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
    filter.append("feMerge")
      .append("feMergeNode").attr("in", "coloredBlur");
    filter.append("feMerge")
      .append("feMergeNode").attr("in", "SourceGraphic");
  };

  return (
    <div
      id="mindmap"
      style={{
        textAlign: "center",
        padding: "20px",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        fontSize: "20px",
      }}
    >
      <h1 style={{ textShadow: "0px 0px 10px #fff" }}>🚀 Interactive Mind Map</h1>
    </div>
  );
};

export default MindMap;
