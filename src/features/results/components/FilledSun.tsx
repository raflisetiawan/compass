import React from "react";
import { Sun } from "lucide-react";

interface FilledSunProps {
  color?: string;
  size?: number;
  className?: string;
}

const FilledSun: React.FC<FilledSunProps> = ({ color = "currentColor", size = 24, className }) => {
  return (
    <Sun 
      width={size} 
      height={size} 
      fill={color} 
      color={color}
      className={className}
    />
  );
};

export default FilledSun;
