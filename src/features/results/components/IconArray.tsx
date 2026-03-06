import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import ReactDOMServer from "react-dom/server";

interface IconArrayProps {
  data: {
    name: string;
    value: number;
    color: string;
    showPill?: boolean;
    Icon?: React.ElementType;
    iconUrl?: string;
    borderColor?: string;
    iconScale?: number;
  }[];
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

      const total = 100;
      const numRows = 10;
      const numCols = 10;
      const iconSize = 15;
      const padding = 4;

      const iconGridWidth = numCols * (iconSize + padding);
      const iconGridHeight = numRows * (iconSize + padding);

      svg
        .attr("viewBox", `0 0 ${iconGridWidth} ${iconGridHeight}`)
        .attr("width", "100%")
        .attr("height", "100%");

      const iconsData: {
        color: string;
        category: string;
        showPill?: boolean;
        Icon?: React.ElementType;
        iconUrl?: string;
        borderColor?: string;
        iconScale?: number;
      }[] = [];
      data.forEach((d) => {
        for (let i = 0; i < d.value; i++) {
          iconsData.push({
            color: d.color,
            category: d.name,
            showPill: d.showPill,
            Icon: d.Icon,
            iconUrl: d.iconUrl,
            borderColor: d.borderColor,
            iconScale: d.iconScale,
          });
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

      iconGroups.each(function (_d, i) {
        const group = d3.select(this);
        const item = iconsData[i];
        if (item) {
          const center = iconSize / 2;
          const radius = center - 1;

          if (item.iconUrl) {
            // Image-based icons
            group
              .append("image")
              .attr("href", item.iconUrl)
              .attr("width", iconSize)
              .attr("height", iconSize);
          } else if (item.Icon) {
            // Custom React icon components (PaperRollIcon, StickManIcon, etc.)
            const IconComponent = item.Icon;
            const scale = item.iconScale || 1;
            const renderSize = iconSize * scale;
            const offset = -(renderSize - iconSize) / 2;

            const iconHtml = ReactDOMServer.renderToString(
              <IconComponent color={item.color} size={renderSize} />
            );
            group
              .append("foreignObject")
              .attr("x", offset)
              .attr("y", offset)
              .attr("width", renderSize)
              .attr("height", renderSize)
              .style("overflow", "visible")
              .html(iconHtml);
          } else {
            // Native SVG circle for simple circle icons
            const circle = group
              .append("circle")
              .attr("cx", center)
              .attr("cy", center)
              .attr("r", radius)
              .attr("fill", item.color);

            if (item.borderColor) {
              circle
                .attr("stroke", item.borderColor)
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "3 2");
            }

            // Draw pill overlay for "with assist" icons
            if (item.showPill) {
              const pillWidth = iconSize * 0.6;
              const pillHeight = iconSize * 0.35;
              const pillRadius = pillHeight / 2;
              const px = center - pillWidth / 2;
              const py = center - pillHeight / 2;

              // Left half - blue
              group
                .append("path")
                .attr("d", `
                  M ${px + pillRadius} ${py}
                  L ${px + pillWidth / 2} ${py}
                  L ${px + pillWidth / 2} ${py + pillHeight}
                  L ${px + pillRadius} ${py + pillHeight}
                  A ${pillRadius} ${pillRadius} 0 0 1 ${px + pillRadius} ${py}
                `)
                .attr("fill", "#007bff")
                .attr("stroke", "black")
                .attr("stroke-width", 0.5);

              // Right half - white
              group
                .append("path")
                .attr("d", `
                  M ${px + pillWidth / 2} ${py}
                  L ${px + pillWidth - pillRadius} ${py}
                  A ${pillRadius} ${pillRadius} 0 0 1 ${px + pillWidth - pillRadius} ${py + pillHeight}
                  L ${px + pillWidth / 2} ${py + pillHeight}
                  Z
                `)
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", 0.5);

              // Center dividing line
              group
                .append("line")
                .attr("x1", px + pillWidth / 2)
                .attr("y1", py)
                .attr("x2", px + pillWidth / 2)
                .attr("y2", py + pillHeight)
                .attr("stroke", "black")
                .attr("stroke-width", 0.5);
            }
          }
        }
      });
    }
  }, [data, windowWidth]);

  return <svg ref={ref}></svg>;
};

export default IconArray;
