const SadFace = ({ color = "#dc3545", size = 24 }) => (
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
      d="M8 16C8 16 9.5 14 12 14C14.5 14 16 16 16 16"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export default SadFace;
