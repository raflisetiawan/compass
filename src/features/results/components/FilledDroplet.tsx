import React from "react";
import { Droplet } from "lucide-react";

interface FilledDropletProps {
  color?: string;
  size?: number;
  className?: string;
}

const FilledDroplet: React.FC<FilledDropletProps> = ({ color = "currentColor", size = 24, className }) => {
  return (
    <Droplet 
      width={size} 
      height={size} 
      fill={color} 
      color={color}
      className={className}
    />
  );
};

export default FilledDroplet;
