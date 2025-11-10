import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import ReactDOMServer from "react-dom/server";

interface IconArrayProps {
  data: {
    name: string;
    value: number;
    color: string;
    Icon?: React.ElementType;
    iconUrl?: string;
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
        Icon?: React.ElementType;
        iconUrl?: string;
      }[] = [];
      data.forEach((d) => {
        for (let i = 0; i < d.value; i++) {
          iconsData.push({
            color: d.color,
            category: d.name,
            Icon: d.Icon,
            iconUrl: d.iconUrl,
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
          if (item.iconUrl) {
            group
              .append("image")
              .attr("href", item.iconUrl)
              .attr("width", iconSize)
              .attr("height", iconSize);
          } else if (item.Icon) {
            const IconComponent = item.Icon;
            const iconHtml = ReactDOMServer.renderToString(
              <IconComponent color={item.color} size={iconSize} />
            );
            group
              .append("foreignObject")
              .attr("width", iconSize)
              .attr("height", iconSize)
              .html(iconHtml);
          } else {
            // Fallback for survival icons
            if (item.category === "Alive" || item.category.includes("Death")) {
              group
                .append("circle")
                .attr("r", iconSize / 2)
                .attr("cx", iconSize / 2)
                .attr("cy", iconSize / 2)
                .attr("fill", item.color);
              group
                .append("circle")
                .attr("r", 1)
                .attr("cx", iconSize / 2 - 3)
                .attr("cy", iconSize / 2 - 1.5)
                .attr("fill", "black");
              group
                .append("circle")
                .attr("r", 1)
                .attr("cx", iconSize / 2 + 3)
                .attr("cy", iconSize / 2 - 1.5)
                .attr("fill", "black");
              const arc = d3
                .arc<void>()
                .innerRadius(iconSize / 5)
                .outerRadius(iconSize / 5);
              if (item.category === "Alive") {
                arc.startAngle(Math.PI * 0.5).endAngle(Math.PI * 1.5);
                group
                  .append("path")
                  .attr("d", arc)
                  .attr(
                    "transform",
                    `translate(${iconSize / 2}, ${iconSize / 2 + 1.5})`
                  )
                  .attr("stroke", "black")
                  .attr("stroke-width", 1);
              } else {
                arc.startAngle(-Math.PI * 0.5).endAngle(Math.PI * 0.5);
                group
                  .append("path")
                  .attr("d", arc)
                  .attr(
                    "transform",
                    `translate(${iconSize / 2}, ${iconSize / 2 + 3.5})`
                  )
                  .attr("stroke", "black")
                  .attr("stroke-width", 1);
              }
            }
          }
        }
      });
    }
  }, [data, windowWidth]);

  return <svg ref={ref}></svg>;
};

export default IconArray;
