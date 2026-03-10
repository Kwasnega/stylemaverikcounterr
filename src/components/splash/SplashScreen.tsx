
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Starfield from "./Starfield";
import PlanetLogo from "./PlanetLogo";
import { useDatabase, useRTDBObject, useMemoFirebase } from "@/firebase";
import { ref } from "firebase/database";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const planetRef = useRef<SVGSVGElement>(null);
  const introTextRef = useRef<HTMLDivElement>(null);
  const brandMessageRef = useRef<HTMLDivElement>(null);
  const rebirthRef = useRef<HTMLHeadingElement>(null);
  const skipBtnRef = useRef<HTMLButtonElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  
  const rtdb = useDatabase();
  const brandRef = useMemoFirebase(() => rtdb ? ref(rtdb, "settings/brand") : null, [rtdb]);
  const { data: brandData } = useRTDBObject(brandRef);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();
      }
    });

    // Initial states
    gsap.set([introTextRef.current, brandMessageRef.current], { opacity: 0, y: 20, visibility: "visible" });
    gsap.set(planetRef.current, { opacity: 0, scale: 1.5, transformOrigin: "center center" });
    gsap.set(flashRef.current, { opacity: 0 });
    gsap.set(skipBtnRef.current, { opacity: 0 });

    // Scene 1: Intro Text
    tl.to(skipBtnRef.current, { opacity: 0.4, duration: 1.0 })
      .to(introTextRef.current, { opacity: 1, y: 0, duration: 2.5, ease: "power3.out" }, 0.2)
      .to(introTextRef.current, { opacity: 0, y: -20, duration: 1.5, ease: "power2.in" }, "+=1.5")
      
      // Scene 2: Logo Reveal & Move Up
      .to(planetRef.current, { opacity: 1, scale: 1.8, duration: 2.0, ease: "power4.out" }, "-=0.3")
      .to(planetRef.current, { 
        y: isMobile ? -240 : -140, // Only mobile goes way up, laptop is more balanced
        scale: 0.85, 
        duration: 2.5, 
        ease: "power4.inOut" 
      }, "+=0.8");

    // Scene 3: Narrative soak-in
    const lines = brandMessageRef.current?.querySelectorAll('.message-line');
    if (lines) {
      tl.to(brandMessageRef.current, { opacity: 1, y: 0, duration: 0.1 }, "-=1.2")
        .fromTo(lines, 
          { opacity: 0, y: 15 },
          { 
            opacity: 1, 
            y: 0, 
            stagger: 3.5, // Even slower for maximum soak-in
            duration: 2.5, 
            ease: "power3.out" 
          }
        );
    }

    // Final Scene: Rebirth & Transition
    tl.fromTo(rebirthRef.current, 
      { opacity: 0, filter: "blur(15px)" }, 
      { 
        opacity: 1, 
        filter: "blur(0px)", 
        duration: 3.5, 
        ease: "power4.out",
        textShadow: "0 0 35px rgba(85, 214, 247, 0.8)"
      }, 
      "+=1.5"
    )
    .to(rebirthRef.current, { 
      color: "#55D6F7", 
      textShadow: "0 0 55px rgba(85, 214, 247, 1)", 
      duration: 3.0, 
      ease: "power1.inOut" 
    })
    .to(flashRef.current, { opacity: 1, duration: 2.5, ease: "power2.in" }, "+=2.0");

    return () => { tl.kill(); };
  }, [onComplete]);

  const evolutionText = "STYLE MAVERIK IS EVOLVING.";

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-black font-body">
      <Starfield />
      <div ref={flashRef} className="fixed inset-0 bg-black z-[150] pointer-events-none" />

      <button ref={skipBtnRef} onClick={onComplete} className="absolute top-10 right-10 z-[110] text-white/30 hover:text-white font-black tracking-[0.5em] uppercase text-[11px] transition-all">
        Skip
      </button>

      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Intro branding */}
        <div ref={introTextRef} className="absolute z-20 text-center px-10 invisible w-full max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-black tracking-[0.3em] text-white uppercase mb-4 italic leading-tight">STYLE MAVERIK</h2>
          <p className="text-[9px] md:text-[11px] tracking-[0.6em] text-primary uppercase font-black opacity-80">Orbits of Luxury Fashion</p>
        </div>

        {/* Brand Logo */}
        <PlanetLogo ref={planetRef} src={brandData?.logoUrl} hideRing={true} className="absolute w-[220px] h-[220px] md:w-[320px] md:h-[320px] z-10" />

        {/* Narrative Flow */}
        <div ref={brandMessageRef} className="absolute z-40 text-center px-8 flex flex-col items-center invisible top-[38%] md:top-[42%] w-full max-w-5xl">
          <div className="message-line mb-8 md:mb-10">
             <h3 className="glitch-text text-base md:text-xl font-black tracking-[0.4em] text-white uppercase italic leading-tight" data-text={evolutionText}>
               {evolutionText}
             </h3>
          </div>
          
          <div className="space-y-4 md:space-y-6 mb-10 md:mb-12">
            <p className="message-line text-[11px] md:text-[14px] tracking-[0.5em] text-white/90 uppercase font-black">A new identity.</p>
            <p className="message-line text-[11px] md:text-[14px] tracking-[0.5em] text-white/90 uppercase font-black">A new vision.</p>
            <p className="message-line text-[11px] md:text-[14px] tracking-[0.5em] text-white/90 uppercase font-black">A new world of design.</p>
          </div>
          
          <p className="message-line text-[10px] md:text-[12px] tracking-[0.8em] text-muted-foreground uppercase mb-6 md:mb-8 italic font-black">Not a relaunch.</p>
          <h2 ref={rebirthRef} className="text-3xl md:text-5xl lg:text-7xl font-black tracking-[0.3em] text-white uppercase italic whitespace-nowrap leading-tight transition-all duration-1000 drop-shadow-[0_0_20px_rgba(85,214,247,0.5)]">This is a rebirth.</h2>
        </div>
      </div>
    </div>
  );
}
