import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import LegendIcon from "./LegendIcon";
import ReactDOMServer from "react-dom/server";

interface IconArrayProps {
  data: {
    name: string;
    value: number;
    color: string;
    showPill?: boolean;
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
        showPill?: boolean;
        Icon?: React.ElementType;
        iconUrl?: string;
      }[] = [];
      data.forEach((d) => {
        for (let i = 0; i < d.value; i++) {
          iconsData.push({
            color: d.color,
            category: d.name,
            showPill: d.showPill,
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
          // If showPill is true, use LegendIcon with pill
          if (item.showPill) {
            const iconHtml = ReactDOMServer.renderToString(
              <LegendIcon color={item.color} name={item.category} showPill={true} size={iconSize} />
            );
            group
              .append("foreignObject")
              .attr("width", iconSize)
              .attr("height", iconSize)
              .html(iconHtml);
          } else if (item.iconUrl) {
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
            // Fallback: Simple circle (using LegendIcon without pill)
            const iconHtml = ReactDOMServer.renderToString(
              <LegendIcon color={item.color} name={item.category} showPill={false} size={iconSize} />
            );
            group
              .append("foreignObject")
              .attr("width", iconSize)
              .attr("height", iconSize)
              .html(iconHtml);
          }
        }
      });
    }
  }, [data, windowWidth]);

  return <svg ref={ref}></svg>;
};

export default IconArray;
