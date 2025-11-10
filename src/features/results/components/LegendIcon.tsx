import React from "react";

interface LegendIconProps {
  color: string;
  name: string;
}

const LegendIcon: React.FC<LegendIconProps> = ({ color, name }) => {
  const iconSize = 16;
  const isAlive = name === "Alive";
  const radius = iconSize / 5; // 3.2

  // Eye positions are consistent
  const eyeX1 = iconSize / 2 - 3;
  const eyeY = iconSize / 2 - 1.5;
  const eyeX2 = iconSize / 2 + 3;

  // This logic now precisely matches the D3 arc logic and translation
  let mouthPath: string;
  if (isAlive) {
    // Smile (bottom semi-circle)
    // D3 translation: (iconSize / 2, iconSize / 2 + 1.5) -> (8, 9.5)
    const cx = iconSize / 2;
    const cy = iconSize / 2 + 1.5;
    const startX = cx + radius; // Start at 3 o'clock
    const startY = cy;
    const endX = cx - radius; // End at 9 o'clock
    const endY = cy;
    // A rx,ry x-axis-rotation large-arc-flag,sweep-flag dx,dy
    // Sweep-flag 1 for clockwise (which is the bottom arc from 3 to 9)
    mouthPath = `M ${startX},${startY} A ${radius},${radius} 0 0 1 ${endX},${endY}`;
  } else {
    // Frown (top semi-circle)
    // D3 translation: (iconSize / 2, iconSize / 2 + 3.5) -> (8, 11.5)
    const cx = iconSize / 2;
    const cy = iconSize / 2 + 3.5;
    const startX = cx - radius; // Start at 9 o'clock
    const startY = cy;
    const endX = cx + radius; // End at 3 o'clock
    const endY = cy;
    // Sweep-flag 1 for clockwise (which is the top arc from 9 to 3)
    mouthPath = `M ${startX},${startY} A ${radius},${radius} 0 0 1 ${endX},${endY}`;
  }

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox={`0 0 ${iconSize} ${iconSize}`}
    >
      {/* Background circle */}
      <circle
        cx={iconSize / 2}
        cy={iconSize / 2}
        r={iconSize / 2}
        fill={color}
      />
      {/* Eyes */}
      <circle cx={eyeX1} cy={eyeY} r={1} fill="black" />
      <circle cx={eyeX2} cy={eyeY} r={1} fill="black" />
      {/* Mouth */}
      <path d={mouthPath} stroke="black" strokeWidth={1} fill="none" />
    </svg>
  );
};

export default LegendIcon;