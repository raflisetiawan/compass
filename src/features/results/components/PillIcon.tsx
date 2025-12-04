import React from "react";

interface PillIconProps {
  size?: number;
}

const PillIcon: React.FC<PillIconProps> = ({ size = 16 }) => {
  const pillWidth = size * 0.8;
  const pillHeight = size * 0.5;
  const pillRadius = pillHeight / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="Medication pill"
      role="img"
    >
      <g transform={`translate(${size/2 - pillWidth/2}, ${size/2 - pillHeight/2})`}>
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
          strokeWidth="0.8"
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
          strokeWidth="0.8"
        />
        {/* Center dividing line */}
        <line
          x1={pillWidth/2}
          y1="0"
          x2={pillWidth/2}
          y2={pillHeight}
          stroke="black"
          strokeWidth="0.8"
        />
      </g>
    </svg>
  );
};

export default PillIcon;
