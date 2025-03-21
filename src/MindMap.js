import React, { useEffect, useState } from "react";
import * as d3 from "d3";

const MindMap = () => {
  const [data, setData] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });

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

    const width = window.innerWidth;
    const height = window.innerHeight;

    d3.select("#mindmap").selectAll("*").remove();

    const svg = d3
      .select("#mindmap")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "#fdf6e3")
      .call(
        d3.zoom().on("zoom", (event) => {
          svgGroup.attr("transform", event.transform);
        })
      )
      .append("g");

    const svgGroup = svg.append("g");

    const cluster = d3.tree().size([height - 200, width / 2]);
    const root = d3.hierarchy(treeData);
    cluster(root);

    // Assign left-right split for children
    root.children.forEach((node, index) => {
      node.y = index % 2 === 0 ? -width / 8 : width / 8;
      node.children?.forEach((child) => {
        child.y = node.y + (node.y < 0 ? -150 : 150);
      });
    });

    // Spread last-level nodes for better spacing
    root.descendants().forEach((node, index) => {
      if (node.depth === 2) {
        node.x += index * 10;
      }
    });

    // Create links with curved paths
    svgGroup
      .selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .linkHorizontal()
          .x((d) => d.y)
          .y((d) => d.x)
      )
      .style("stroke-dasharray", "4,4");

    // Create nodes
    const node = svgGroup
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .on("click", (event, d) => {
        setTooltip({ visible: true, text: `Info: ${d.data.name}`, x: event.pageX, y: event.pageY });
      });

    // Add rectangular boxes
    node
      .append("rect")
      .attr("width", 120)
      .attr("height", 50)
      .attr("x", (d) => (d.y < 0 ? -120 : 0))
      .attr("y", -25)
      .attr("rx", 15)
      .attr("ry", 15)
      .attr("fill", (d) => (d.depth === 0 ? "#b39ddb" : d.depth % 2 === 0 ? "#ffd54f" : "#81c784"))
      .attr("stroke", "#555")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).attr("fill", "#ff7043");
      })
      .on("mouseout", function (d) {
        d3.select(this).attr("fill", d.depth === 0 ? "#b39ddb" : d.depth % 2 === 0 ? "#ffd54f" : "#81c784");
      });

    // Add text labels inside boxes
    node
      .append("text")
      .attr("dy", ".35em")
      .attr("x", (d) => (d.y < 0 ? -60 : 60))
      .attr("text-anchor", "middle")
      .text((d) => d.data.name)
      .style("fill", "#333")
      .style("font-size", "14px")
      .style("font-weight", "bold");

    // Auto-Fit Everything on Load
    const bounds = svgGroup.node().getBBox();
    const scaleFactor = Math.min(width / (bounds.width + 200), height / (bounds.height + 200)) * 0.9;
    const xOffset = (width - bounds.width * scaleFactor) / 2 - bounds.x * scaleFactor;
    const yOffset = (height - bounds.height * scaleFactor) / 2 - bounds.y * scaleFactor;

    svg.transition().duration(500).call(
      d3.zoom().transform,
      d3.zoomIdentity.translate(xOffset, yOffset).scale(scaleFactor)
    );
  };

  return (
    <div
      id="mindmap"
      style={{
        textAlign: "center",
        padding: "20px",
        fontFamily: "'Comic Sans MS', cursive, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "24px", color: "#6A0572", textShadow: "0px 0px 8px #aaa" }}>
        🌟 Perfectly Aligned Mind Map
      </h1>

      {tooltip.visible && (
        <div
          style={{
            position: "absolute",
            top: tooltip.y,
            left: tooltip.x,
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            zIndex: 10,
          }}
          onClick={() => setTooltip({ visible: false, text: "", x: 0, y: 0 })}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default MindMap;
