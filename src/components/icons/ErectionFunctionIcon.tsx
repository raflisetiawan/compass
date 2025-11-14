import React from "react";

interface ErectionFunctionIconProps {
  size?: number;
  color?: string;
  withAssist?: boolean;
}

const ErectionFunctionIcon: React.FC<ErectionFunctionIconProps> = ({
  size = 24,
  color = "#28a745", // green default
  withAssist = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill={color}
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="1"
      />
      {/* capsule icon */}
      {withAssist && (
        <svg
          x="6"
          y="9"
          width="12"
          height="6"
          viewBox="0 0 80 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 20,0 L 40,0 L 40,40 L 20,40 A 20,20 0 0 1 20,0 Z"
            fill="#3B5998"
          />

          <path
            d="M 40,0 L 60,0 A 20,20 0 0 1 60,40 L 40,40 Z"
            fill="#FFFFFF"
          />

          <path
            d="M 20,0 A 20,20 0 0 0 20,40 L 60,40 A 20,20 0 0 0 60,0 Z"
            fill="none"
            stroke="#D0D0D0"
            strokeWidth="1.5"
          />
        </svg>
      )}
    </svg>
  );
};

export default ErectionFunctionIcon;
