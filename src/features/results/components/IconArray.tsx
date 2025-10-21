import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface IconArrayProps {
  data: { name: string; value: number; color: string }[];
}

const IconArray = ({ data }: IconArrayProps) => {
  const ref = useRef<SVGSVGElement>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (ref.current && data) {
      const svg = d3.select(ref.current);
      svg.selectAll("*").remove(); // Clear previous render

      const isMobile = windowWidth < 768; // Tailwind's md breakpoint

      const total = 100;
      const numRows = 10;
      const numCols = 10;
      const iconSize = 15;
      const padding = 4;

      const iconGridWidth = numCols * (iconSize + padding);
      const iconGridHeight = numRows * (iconSize + padding);

      const legendWidth = 250; // Space for legend
      const legendHeight = data.length * 25 + 40; // Estimated height for the legend

      const width = isMobile ? iconGridWidth : iconGridWidth + legendWidth;
      const height = isMobile
        ? iconGridHeight + legendHeight + 30
        : iconGridHeight;

      svg
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%");

      const iconsData: { color: string; category: string }[] = [];
      data.forEach((d) => {
        for (let i = 0; i < d.value; i++) {
          iconsData.push({ color: d.color, category: d.name });
        }
      });

      const iconGrid = svg.append("g");

      const iconGroups = iconGrid
        .selectAll("g")
        .data(d3.range(total))
        .enter()
        .append("g")
        .attr("transform", (_d, i) => {
          const x = (i % numCols) * (iconSize + padding);
          const y = Math.floor(i / numCols) * (iconSize + padding);
          return `translate(${x}, ${y})`;
        });

      iconGroups
        .append("circle")
        .attr("r", iconSize / 2)
        .attr("cx", iconSize / 2)
        .attr("cy", iconSize / 2)
        .attr("fill", (_d, i) => iconsData[i]?.color || "#ccc");

      iconGroups
        .append("circle")
        .attr("r", 1)
        .attr("cx", iconSize / 2 - 3)
        .attr("cy", iconSize / 2 - 1.5)
        .attr("fill", "black");
      iconGroups
        .append("circle")
        .attr("r", 1)
        .attr("cx", iconSize / 2 + 3)
        .attr("cy", iconSize / 2 - 1.5)
        .attr("fill", "black");

      iconGroups
        .filter((_d, i) => iconsData[i]?.category === "Alive")
        .append("path")
        .attr(
          "d",
          d3
            .arc<void, void>()
            .innerRadius(iconSize / 5)
            .outerRadius(iconSize / 5)
            .startAngle(Math.PI * 0.5)
            .endAngle(Math.PI * 1.5)()
        )
        .attr("transform", `translate(${iconSize / 2}, ${iconSize / 2 + 1.5})`)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("fill", "none");
      iconGroups
        .filter((_d, i) => iconsData[i]?.category !== "Alive")
        .append("path")
        .attr(
          "d",
          d3
            .arc<void, void>()
            .innerRadius(iconSize / 5)
            .outerRadius(iconSize / 5)
            .startAngle(-Math.PI * 0.5)
            .endAngle(Math.PI * 0.5)()
        )
        .attr("transform", `translate(${iconSize / 2}, ${iconSize / 2 + 3.5})`)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("fill", "none");

      // Legend
      const legend = svg.append("g").attr("transform", () => {
        if (isMobile) {
          const legendX = (iconGridWidth - legendWidth) / 2;
          return `translate(${legendX > 0 ? legendX : 0}, ${
            iconGridHeight + 40
          })`;
        }
        return `translate(${iconGridWidth + 20}, 10)`;
      });

      legend.append("text").text("Legend:").attr("font-weight", "bold");

      const legendItems = legend
        .selectAll(".legend-item")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (_d, i) => `translate(0, ${i * 25 + 20})`);

      const legendIconGroup = legendItems.append("g");

      legendIconGroup
        .append("circle")
        .attr("r", iconSize / 2)
        .attr("cx", iconSize / 2)
        .attr("cy", iconSize / 2)
        .attr("fill", (d) => d.color);

      legendIconGroup
        .append("circle")
        .attr("r", 1)
        .attr("cx", iconSize / 2 - 3)
        .attr("cy", iconSize / 2 - 1.5)
        .attr("fill", "black");
      legendIconGroup
        .append("circle")
        .attr("r", 1)
        .attr("cx", iconSize / 2 + 3)
        .attr("cy", iconSize / 2 - 1.5)
        .attr("fill", "black");

      legendIconGroup
        .filter((d) => d.name === "Alive")
        .append("path")
        .attr(
          "d",
          d3
            .arc<void, void>()
            .innerRadius(iconSize / 5)
            .outerRadius(iconSize / 5)
            .startAngle(Math.PI * 0.5)
            .endAngle(Math.PI * 1.5)()
        )
        .attr("transform", `translate(${iconSize / 2}, ${iconSize / 2 + 1.5})`)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("fill", "none");

      legendIconGroup
        .filter((d) => d.name !== "Alive")
        .append("path")
        .attr(
          "d",
          d3
            .arc<void, void>()
            .innerRadius(iconSize / 5)
            .outerRadius(iconSize / 5)
            .startAngle(-Math.PI * 0.5)
            .endAngle(Math.PI * 0.5)()
        )
        .attr("transform", `translate(${iconSize / 2}, ${iconSize / 2 + 3.5})`)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("fill", "none");

      legendItems
        .append("text")
        .attr("x", iconSize + 10)
        .attr("y", iconSize / 2 + 5)
        .text((d) => `${d.name} (${d.value}%)`)
        .attr("font-size", "11px");
    }
  }, [data, windowWidth]);

  return <svg ref={ref}></svg>;
};

export default IconArray;
