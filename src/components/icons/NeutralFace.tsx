const NeutralFace = ({ color = "#ffc107", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" fill={color} />
    <circle cx="9" cy="10" r="1.5" fill="black" />
    <circle cx="15" cy="10" r="1.5" fill="black" />
    <line
      x1="8"
      y1="15"
      x2="16"
      y2="15"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default NeutralFace;
