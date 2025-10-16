import React from 'react';

const EyeOffIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.06 18.06 0 0 1 4.51-4.51M19.73 10.73A10.07 10.07 0 0 0 22 12c0 7-3 7-10 7a18.06 18.06 0 0 1-4.51-4.51" />
    <path d="M12 12v2" />
    <path d="M4.22 4.22 19.78 19.78" />
    <path d="M12 7V5" />
  </svg>
);

export default EyeOffIcon;