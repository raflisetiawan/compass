const HappyFace = ({ color = "#28a745", size = 24 }) => (
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
    <path
      d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default HappyFace;
