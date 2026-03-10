
"use client";

import React, { forwardRef } from "react";

interface PlanetLogoProps extends React.SVGProps<SVGSVGElement> {
  src?: string;
  hideRing?: boolean;
}

const PlanetLogo = forwardRef<SVGSVGElement, PlanetLogoProps>(({ src, hideRing = false, ...props }, ref) => {
  return (
    <svg
      ref={ref}
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
      {...props}
    >
      <defs>
        <radialGradient id="planetGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#1E293B" />
        </radialGradient>
      </defs>

      {/* Outer Halo - Reduced for mobile-friendly rendering */}
      <circle 
        cx="150" 
        cy="150" 
        r="120" 
        fill="#55D6F7" 
        opacity="0.08" 
        style={{ filter: "blur(40px)" }} 
      />
      
      {/* Massive Orbital Ring - Conditional */}
      {!hideRing && (
        <ellipse 
          cx="150" 
          cy="150" 
          rx="145" 
          ry="50" 
          fill="none" 
          stroke="white" 
          strokeWidth="14" 
          transform="rotate(-75 150 150)" 
          style={{ filter: "drop-shadow(0 0 15px rgba(255,255,255,0.3))" }}
        />
      )}

      {/* Sphere / Logo Reveal */}
      {src ? (
        <g>
          {/* Subtle backing sphere for the logo */}
          <circle cx="150" cy="150" r="90" fill="rgba(255,255,255,0.03)" />
          {/* Using native SVG image for perfect mobile alignment */}
          <image
            href={src}
            x="60"
            y="60"
            width="180"
            height="180"
            preserveAspectRatio="xMidYMid meet"
            style={{ 
              filter: "drop-shadow(0 0 20px rgba(85, 214, 247, 0.4))",
              transform: "translateZ(0)"
            }}
          />
        </g>
      ) : (
        <circle 
          cx="150" 
          cy="150" 
          r="90" 
          fill="url(#planetGrad)" 
          style={{ filter: "drop-shadow(0 0 30px rgba(255,255,255,0.2))" }} 
        />
      )}
    </svg>
  );
});

PlanetLogo.displayName = "PlanetLogo";

export default PlanetLogo;
