"use client";

import { useEffect, useState } from "react";
import SplashScreen from "@/components/splash/SplashScreen";
import LandingPage from "@/app/landing/page";

export default function Home() {
  const [showSplash, setShowSplash] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the user has already seen the splash screen in this session/device
    const visited = localStorage.getItem("visitedSplash");
    if (visited === "true") {
      setShowSplash(false);
    } else {
      setShowSplash(true);
    }
  }, []);

  const handleSplashComplete = () => {
    localStorage.setItem("visitedSplash", "true");
    setShowSplash(false);
  };

  // Prevent flicker during check
  if (showSplash === null) return <div className="min-h-screen bg-black" />;

  return (
    <main className="relative w-screen min-h-screen overflow-x-hidden bg-black">
      {showSplash ? (
        <SplashScreen onComplete={handleSplashComplete} />
      ) : (
        <LandingPage />
      )}
    </main>
  );
}
