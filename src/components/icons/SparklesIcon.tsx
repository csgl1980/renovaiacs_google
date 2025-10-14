import React from 'react';

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 3L9.25 9.25L3 12L9.25 14.75L12 21L14.75 14.75L21 12L14.75 9.25L12 3Z" />
    <path d="M5 3L6.05 6.05" />
    <path d="M18.36 5.64L17.31 8.69" />
    <path d="M21 17L17.95 17.95" />
    <path d="M8.69 17.31L5.64 18.36" />
  </svg>
);

export default SparklesIcon;