import React from "react";

interface LegendIconProps {
  color: string;
  name: string;
}

const LegendIcon: React.FC<LegendIconProps> = ({ color, name }) => {
  const iconSize = 16;

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
        cx={iconSize / 2}
        cy={iconSize / 2}
        r={iconSize / 2}
        fill={color}
      />
    </svg>
  );
};

export default LegendIcon;