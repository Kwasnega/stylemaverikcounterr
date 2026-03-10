
"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  targetOpacity: number;
  color: string;
  speed: number;
  angle: number;
  isKXY?: boolean;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    const starCount = 400;
    const colors = ["#FFFFFF", "#E2E8F0", "#F8FAFC", "#BAE6FD"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      
      // Define KXY Constellation Points (normalized 0-100)
      // Subtle position in the upper-left quadrant
      const kxyPoints = [
        // K
        { x: 8, y: 10 }, { x: 8, y: 14 }, { x: 8, y: 18 }, { x: 8, y: 22 }, { x: 8, y: 26 },
        { x: 11, y: 18 }, { x: 14, y: 10 }, { x: 14, y: 26 },
        // X
        { x: 19, y: 10 }, { x: 25, y: 26 }, { x: 25, y: 10 }, { x: 19, y: 26 }, { x: 22, y: 18 },
        // Y
        { x: 30, y: 10 }, { x: 33, y: 18 }, { x: 36, y: 10 }, { x: 33, y: 22 }, { x: 33, y: 26 }
      ];

      // Add Constellation stars (Blended to look like natural stars)
      kxyPoints.forEach(p => {
        stars.push({
          x: (p.x * canvas.width) / 100,
          y: (p.y * canvas.height) / 100,
          size: Math.random() * 1.2 + 0.6, 
          opacity: Math.random() * 0.5 + 0.2,
          targetOpacity: Math.random() * 0.7,
          color: "#FFFFFF", 
          speed: 0.006, 
          angle: Math.random() * Math.PI * 2,
          isKXY: true
        });
      });

      // Add Background stars
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.2 + 0.2,
          opacity: Math.random(),
          targetOpacity: Math.random(),
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: Math.random() * 0.015 + 0.004, // Ultra slow drift
          angle: Math.random() * Math.PI * 2
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        // Subtle drift movement
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;

        // Twinkle effect (Gentle)
        if (Math.abs(star.opacity - star.targetOpacity) < 0.01) {
          star.targetOpacity = Math.random();
        } else {
          star.opacity += (star.targetOpacity - star.opacity) * 0.003;
        }

        // Wrap around screen
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = star.color;
        
        // Add minimal glow only to slightly larger stars
        if (star.size > 1.2 || star.isKXY) {
          ctx.shadowBlur = star.isKXY ? 4 : 2;
          ctx.shadowColor = star.color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-black"
    />
  );
}
