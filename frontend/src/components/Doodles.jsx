import React from "react";

// Simple SVG-style hand-drawn doodles. Use as decorative accents.

export const DoodleCoffeeBean = ({ className = "", size = 28 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 10c10-4 22 2 26 12s-2 22-12 26-22-2-26-12 2-22 12-26z" />
    <path d="M28 16c4 6 4 22-4 32" strokeDasharray="2 3" />
  </svg>
);

export const DoodleArrow = ({ className = "", size = 60 }) => (
  <svg
    className={className}
    width={size}
    height={size * 0.6}
    viewBox="0 0 120 70"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 35c14-22 36-30 64-22 14 4 28 14 38 28" />
    <path d="M95 28l12 13-15 6" />
  </svg>
);

export const DoodleCup = ({ className = "", size = 56 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 22h36v18a10 10 0 0 1-10 10H20a10 10 0 0 1-10-10V22z" />
    <path d="M46 26h6a6 6 0 0 1 0 12h-6" />
    <path d="M18 8c-2 4 2 4 0 8M28 8c-2 4 2 4 0 8M38 8c-2 4 2 4 0 8" />
  </svg>
);

export const DoodleStar = ({ className = "", size = 24 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3l2.5 6 6.5.6-5 4.5 1.5 6.4L12 17l-5.5 3.5L8 14.1 3 9.6 9.5 9z" />
  </svg>
);

export const DoodleSwirl = ({ className = "", size = 80 }) => (
  <svg
    className={className}
    width={size}
    height={size * 0.5}
    viewBox="0 0 160 80"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
  >
    <path d="M5 60c20-30 60-30 80 0s60 30 70-10" />
  </svg>
);

export const DoodleLeaf = ({ className = "", size = 36 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 56c4-26 22-44 48-48-2 26-18 44-44 48z" />
    <path d="M14 50c12-12 24-22 38-32" />
  </svg>
);

export const DoodleUtensils = ({ className = "", size = 36 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6v22a4 4 0 0 0 4 4v24" />
    <path d="M14 6v14M22 6v14" />
    <path d="M44 6c-6 0-10 6-10 14s4 14 10 14v22" />
  </svg>
);
