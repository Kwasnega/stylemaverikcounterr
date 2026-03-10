"use client";

import React, { forwardRef } from "react";

const Rocket = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => {
  return (
    <svg
      ref={ref}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 0 15px rgba(85, 214, 247, 0.6))" }}
      {...props}
    >
      <defs>
        <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#B6C2CC" />
        </linearGradient>
      </defs>
      
      {/* Engine Flame */}
      <path
        d="M50 85 L42 105 L50 98 L58 105 Z"
        fill="#55D6F7"
      >
        <animate
          attributeName="opacity"
          values="1;0.6;1"
          dur="0.1s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="d"
          values="M50 85 L42 105 L50 98 L58 105 Z; M50 85 L40 115 L50 105 L60 115 Z; M50 85 L42 105 L50 98 L58 105 Z"
          dur="0.15s"
          repeatCount="indefinite"
        />
      </path>

      {/* Fins */}
      <path d="M35 75 L50 55 L65 75 Z" fill="#78848E" />

      {/* Main Body */}
      <path
        d="M50 5 C68 45 68 80 50 90 C32 80 32 45 50 5"
        fill="url(#rocketBody)"
      />
      
      {/* KXY Text */}
      <text
        x="50"
        y="55"
        fontSize="8"
        fontWeight="black"
        fill="#0a0a0b"
        textAnchor="middle"
        style={{ fontFamily: 'sans-serif', letterSpacing: '1px' }}
      >
        KXY
      </text>
      
      {/* Window */}
      <circle cx="50" cy="35" r="5" fill="#0a0a0b" />
      <circle cx="50" cy="35" r="2.5" fill="#55D6F7" opacity="0.8" />
    </svg>
  );
});

Rocket.displayName = "Rocket";

export default Rocket;
