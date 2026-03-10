
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Starfield from "@/components/splash/Starfield";
import PlanetLogo from "@/components/splash/PlanetLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, Music2 as TikTok, ChevronDown, Loader2, Users } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useDatabase, useRTDBObject, useRTDBList, useMemoFirebase } from "@/firebase";
import { ref, push, set, serverTimestamp, query, equalTo, orderByChild, get } from "firebase/database";
import { useToast } from "@/hooks/use-toast";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </svg>
);

const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M12 1.5c-4.1 0-7.5 3.1-7.5 7.1 0 1.2.3 2.3.9 3.2-.8.5-1.4 1.3-1.4 2.2 0 .8.5 1.5 1.2 1.9-.1.2-.2.4-.2.6 0 1.1 1.3 1.9 3 1.9.4 0 .7-.1 1-.2.5.7 1.3 1.2 2.2 1.2s1.7-.5 2.2-1.2c.3.1.6.2 1 .2 1.7 0 3-.8 3-1.9 0-.2-.1-.4-.2-.6.7-.4 1.2-1.1 1.2-1.9 0-.9-.6-1.7-1.4-2.2.6-.9.9-2 .9-3.2 0-4-3.4-7.1-7.5-7.1z" />
  </svg>
);

export default function LandingPage() {
  const rtdb = useDatabase();
  const { toast } = useToast();
  
  const launchRef = useMemoFirebase(() => rtdb ? ref(rtdb, "settings/launch") : null, [rtdb]);
  const { data: launchData } = useRTDBObject(launchRef);

  const galleryRef = useMemoFirebase(() => rtdb ? ref(rtdb, "settings/gallery") : null, [rtdb]);
  const { data: customGallery } = useRTDBObject(galleryRef);

  const brandRef = useMemoFirebase(() => rtdb ? ref(rtdb, "settings/brand") : null, [rtdb]);
  const { data: brandData } = useRTDBObject(brandRef);

  const waitlistRef = useMemoFirebase(() => rtdb ? ref(rtdb, "waitlist") : null, [rtdb]);
  const { data: waitlistEntries } = useRTDBList(waitlistRef);

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const pageWrapperRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const backgroundLogoRef = useRef<SVGSVGElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const defaultLaunchDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    gsap.set(pageWrapperRef.current, { opacity: 0 });
    gsap.set([navbarRef.current, ...heroRef.current?.querySelectorAll('.hero-fade') || []], { opacity: 0, y: 30 });

    const tl = gsap.timeline();
    tl.to(pageWrapperRef.current, { opacity: 1, duration: 2.0, ease: "power2.inOut" })
      .to(navbarRef.current, { opacity: 1, y: 0, duration: 1.0, ease: "power3.out" }, "-=1.0")
      .to(heroRef.current?.querySelectorAll('.hero-fade'), { 
        opacity: 1, 
        y: 0, 
        duration: 1.2, 
        stagger: 0.15, 
        ease: "power4.out"
      }, "-=0.8");

    gsap.to(backgroundLogoRef.current, { rotation: 360, duration: 120, repeat: -1, ease: "none" });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      tl.kill();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const targetDate = launchData?.launchDate ? new Date(launchData.launchDate) : defaultLaunchDate;
      const distance = targetDate.getTime() - now;
      if (distance < 0) { 
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); 
        return; 
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [launchData]);

  useEffect(() => {
    if (submitted && successRef.current) {
      gsap.fromTo(successRef.current, 
        { opacity: 0, y: 60, filter: "blur(25px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.5, ease: "power4.out" }
      );
    }
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || !rtdb) return;
    const formData = new FormData(e.currentTarget);
    const name = (formData.get('name') as string).trim();
    const email = (formData.get('email') as string).trim();
    
    if (!name || name.length < 2) return toast({ variant: "destructive", title: "Error", description: "Name required." });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast({ variant: "destructive", title: "Error", description: "Valid email required." });

    setIsSubmitting(true);
    
    try {
      const waitlistRef = ref(rtdb, 'waitlist');
      const emailQuery = query(waitlistRef, orderByChild('email'), equalTo(email));
      const snapshot = await get(emailQuery);
      
      if (!snapshot.exists()) {
        const newEntryRef = push(waitlistRef);
        await set(newEntryRef, {
          name,
          email,
          timestamp: serverTimestamp(),
        });
      }
      
      gsap.to(formRef.current, { 
        y: 30, 
        opacity: 0, 
        filter: "blur(20px)", 
        duration: 0.8, 
        ease: "power3.inOut", 
        onComplete: () => {
          setSubmitted(true);
          setIsSubmitting(false);
        }
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Transmission Failed", description: "Orbit connection interrupted." });
      setIsSubmitting(false);
    }
  };

  const galleryImages = [
    customGallery?.img1 || PlaceHolderImages[0].imageUrl,
    customGallery?.img2 || PlaceHolderImages[1].imageUrl,
    customGallery?.img3 || PlaceHolderImages[2].imageUrl,
  ];

  const totalPioneers = waitlistEntries?.length || 0;

  return (
    <div ref={pageWrapperRef} className="relative min-h-screen w-full bg-black text-white font-body overflow-x-hidden opacity-0">
      <Starfield />
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <PlanetLogo ref={backgroundLogoRef} className="w-[140%] h-[140%] md:w-[90%] md:h-[90%] opacity-80" />
      </div>

      <nav ref={navbarRef} className={cn("fixed top-0 left-0 w-full h-16 md:h-24 z-[100] flex items-center justify-center transition-all px-6", isScrolled ? "bg-black/90 backdrop-blur-3xl border-b border-white/5" : "bg-transparent")}>
        <div className="flex items-center gap-4">
          {brandData?.logoUrl ? (
            <img src={brandData.logoUrl} alt="Logo" className="h-10 md:h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
          ) : (
            <PlanetLogo hideRing={true} className="w-10 h-10 md:w-16 md:h-16 opacity-80" />
          )}
          <span className="text-[10px] tracking-[0.5em] font-black uppercase italic text-white/30 hidden sm:inline">Style Maverik</span>
        </div>
      </nav>

      <main className="relative z-10">
        <section ref={heroRef} className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-12">
          <h1 className="hero-fade text-5xl md:text-9xl font-black tracking-[0.4em] text-white uppercase mb-12 italic drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] leading-tight">STYLE MAVERIK</h1>
          <div className="hero-fade flex items-center justify-center text-[10px] md:text-sm tracking-[0.8em] md:tracking-[1.4em] text-accent uppercase mb-16 font-black whitespace-nowrap">
            <span>A NEW ERA IS ARRIVING</span>
          </div>
          <div ref={countdownRef} className="hero-fade grid grid-cols-4 gap-4 md:gap-16 mb-20 relative scale-[1.3] md:scale-[1.8]">
            {[ { label: "DAYS", value: timeLeft.days }, { label: "HOURS", value: timeLeft.hours }, { label: "MINUTES", value: timeLeft.minutes }, { label: "SECONDS", value: timeLeft.seconds } ].map((unit, i) => (
              <div key={i} className="unit-container flex flex-col items-center relative">
                <span className="digits-display text-4xl md:text-7xl font-black tabular-nums tracking-tighter text-white">
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className="text-[8px] md:text-[10px] tracking-[0.4em] text-white/60 mt-4 uppercase font-black">{unit.label}</span>
              </div>
            ))}
          </div>
          <p className="hero-fade text-[10px] md:text-xl tracking-[0.5em] text-white uppercase mb-12 max-w-4xl font-black italic leading-relaxed opacity-80">"We Wear The Future"</p>
          {!submitted && <div className="hero-fade animate-bounce mt-4"><ChevronDown className="w-8 h-8 text-white/40" /></div>}
        </section>

        <section className="py-20 px-6 flex flex-col items-center relative min-h-[600px]">
          {!submitted ? (
            <div ref={formRef} className="w-full max-w-md bg-transparent p-8 md:p-10 border border-white/10 text-center backdrop-blur-none shadow-2xl relative overflow-hidden group">
              <div className="mb-10 space-y-4">
                <div className="flex items-center justify-center gap-3 text-accent mb-4">
                  <Users className="w-4 h-4" />
                  <span className="text-[10px] tracking-[0.3em] font-black uppercase">{totalPioneers.toLocaleString()} STYLE MAVERIKS</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black tracking-[0.4em] text-white uppercase italic">JOIN THE WAITLIST</h3>
                <p className="text-[10px] tracking-[0.3em] text-accent uppercase font-black opacity-80">BE THE FIRST TO KNOW</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] tracking-[0.2em] uppercase text-white/60 font-black">YOUR NAME</Label>
                    <Input id="name" name="name" required disabled={isSubmitting} placeholder="Enter your name" className="bg-white/5 border-white/10 text-white rounded-none font-black h-12 px-5 text-base focus:ring-accent" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] tracking-[0.2em] uppercase text-white/60 font-black">YOUR EMAIL</Label>
                    <Input id="email" name="email" type="email" required disabled={isSubmitting} placeholder="name@example.com" className="bg-white/5 border-white/10 text-white rounded-none font-black h-12 px-5 text-base focus:ring-accent" />
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-white text-black hover:bg-accent hover:text-white font-black tracking-[0.4em] rounded-none uppercase text-xs transition-all duration-500 shadow-2xl">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "JOIN WAITLIST"}
                </Button>
              </form>
            </div>
          ) : (
            <div ref={successRef} className="w-full max-w-5xl text-center py-6 px-4">
              <div className="mb-16 space-y-4">
                <h3 className="text-2xl md:text-5xl font-black tracking-[0.5em] text-white uppercase mb-2 italic">YOU'RE ON THE LIST!</h3>
                <p className="text-[11px] md:text-sm text-accent tracking-[0.4em] uppercase font-black">WELCOME TO THE CIRCLE. WE'LL BE IN TOUCH SOON.</p>
              </div>
              <div className="space-y-12">
                <h4 className="text-[10px] md:text-xs tracking-[0.8em] text-white/40 uppercase font-black">EXCLUSIVE PREVIEW</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  {galleryImages.map((url, i) => (
                    <div key={i} className="group relative aspect-[4/5] overflow-hidden border-2 border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-transform duration-700 bg-black/40">
                      <Image src={url} alt={`Teaser ${i+1}`} fill className="object-cover transition-all duration-1000 blur-lg opacity-70 grayscale" />
                      <div className="absolute inset-0 bg-black/20 backdrop-blur-md transition-opacity duration-700" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] tracking-[1em] text-white/40 uppercase font-black">COMING SOON</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <footer className="py-8 px-6 border-t border-white/5 bg-transparent">
          <div className="max-w-7xl mx-auto flex flex-col items-center space-y-6">
            <div className="flex justify-center space-x-10 md:space-x-14">
              <a href="https://instagram.com/stylemaverik_clothing" target="_blank" className="text-white/40 hover:text-accent transition-all hover:scale-125 duration-500"><Instagram className="w-5 h-5" /></a>
              <a href="https://tiktok.com/@stylemaverik_clothing" target="_blank" className="text-white/40 hover:text-accent transition-all hover:scale-125 duration-500"><TikTok className="w-5 h-5" /></a>
              <a href="https://x.com/stylemaverik_clothing" target="_blank" className="text-white/40 hover:text-accent transition-all hover:scale-125 duration-500"><XIcon className="w-5 h-5" /></a>
            </div>
            <p className="text-[8px] tracking-[0.6em] text-white/30 font-black uppercase italic text-center">&copy; 2026 STYLE MAVERIK | DESIGNING THE NEW WORLD</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
