import React from "react";

interface LegendIconProps {
  color: string;
  name: string;
  showPill?: boolean;
  size?: number;
}

const LegendIcon: React.FC<LegendIconProps> = ({ color, name, showPill = false, size = 16 }) => {
  const iconSize = size;
  const center = iconSize / 2;
  const pillWidth = iconSize * 0.6;
  const pillHeight = iconSize * 0.35;
  const pillRadius = pillHeight / 2;

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox={`0 0 ${iconSize} ${iconSize}`}
      aria-label={name}
      role="img"
    >
      <title>{name}</title>
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={center}
        fill={color}
      />
      {/* Pill icon if showPill is true */}
      {showPill && (
        <g transform={`translate(${center - pillWidth/2}, ${center - pillHeight/2})`}>
          {/* Left half - blue */}
          <path
            d={`
              M ${pillRadius} 0
              L ${pillWidth/2} 0
              L ${pillWidth/2} ${pillHeight}
              L ${pillRadius} ${pillHeight}
              A ${pillRadius} ${pillRadius} 0 0 1 ${pillRadius} 0
            `}
            fill="#007bff"
            stroke="black"
            strokeWidth="0.5"
          />
          {/* Right half - white */}
          <path
            d={`
              M ${pillWidth/2} 0
              L ${pillWidth - pillRadius} 0
              A ${pillRadius} ${pillRadius} 0 0 1 ${pillWidth - pillRadius} ${pillHeight}
              L ${pillWidth/2} ${pillHeight}
              Z
            `}
            fill="white"
            stroke="black"
            strokeWidth="0.5"
          />
          {/* Center dividing line */}
          <line
            x1={pillWidth/2}
            y1="0"
            x2={pillWidth/2}
            y2={pillHeight}
            stroke="black"
            strokeWidth="0.5"
          />
        </g>
      )}
    </svg>
  );
};

export default LegendIcon;