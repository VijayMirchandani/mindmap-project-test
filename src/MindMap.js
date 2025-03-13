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
      .style("background", "white")
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const cluster = d3.cluster().size([360, radius]);
    const root = d3.hierarchy(treeData);
    cluster(root);

    // Create gradient colors
    const colors = ["#FFC107", "#FF5722", "#03A9F4", "#8BC34A", "#673AB7", "#E91E63"];

    // Create links (curved)
    svg
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

    // Add colorful bubbles
    node
      .append("circle")
      .attr("r", (d) => (d.depth === 0 ? 40 : 35)) // Bigger for center
      .attr("fill", (d) => (d.depth === 0 ? "#444" : colors[d.depth % colors.length]))
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .style("filter", "url(#glow)");

    // Add text labels inside bubbles
    node
      .append("text")
      .attr("dy", ".31em")
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .text((d) => d.data.name)
      .style("fill", "white")
      .style("font-size", "14px")
      .style("font-weight", "bold");

    // Add hover glow effect
    node
      .on("mouseover", function () {
        d3.select(this).select("circle").attr("filter", "url(#glow-hover)");
      })
      .on("mouseout", function () {
        d3.select(this).select("circle").attr("filter", "url(#glow)");
      });

    // Define glowing effects
    const defs = svg.append("defs");

    const glow = defs.append("filter").attr("id", "glow");
    glow.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
    glow.append("feMerge").append("feMergeNode").attr("in", "coloredBlur");
    glow.append("feMerge").append("feMergeNode").attr("in", "SourceGraphic");

    const glowHover = defs.append("filter").attr("id", "glow-hover");
    glowHover.append("feGaussianBlur").attr("stdDeviation", "6").attr("result", "coloredBlur");
    glowHover.append("feMerge").append("feMergeNode").attr("in", "coloredBlur");
    glowHover.append("feMerge").append("feMergeNode").attr("in", "SourceGraphic");
  };

  return (
    <div
      id="mindmap"
      style={{
        textAlign: "center",
        padding: "20px",
        background: "#f8f9fa",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "24px", color: "#444", textShadow: "0px 0px 8px #aaa" }}>
        🧠 Beautiful Interactive Mind Map
      </h1>
    </div>
  );
};

export default MindMap;
