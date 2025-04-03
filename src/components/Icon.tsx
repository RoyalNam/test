import React from "react";

interface IconProps {
  path: string;
  fill?: string;
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  viewBox?: string;
}

const Icon: React.FC<IconProps> = ({
  path,
  fill = "currentColor",
  size = 32,
  className,
  style,
  viewBox = "0 0 24 24",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox={viewBox}
    style={{ fill, ...style }}
    className={className}
  >
    <path d={path} />
  </svg>
);

export default Icon;
