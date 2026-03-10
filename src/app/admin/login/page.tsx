"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Starfield from "@/components/splash/Starfield";
import PlanetLogo from "@/components/splash/PlanetLogo";
import gsap from "gsap";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    gsap.fromTo(
      ".login-card",
      { opacity: 0, y: 30, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power4.out" }
    );
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({
        variant: "destructive",
        title: "System Error",
        description: "Firebase Auth not initialized. Check configuration.",
      });
      return;
    }
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Access Granted",
        description: "Welcome back to the Maverik Orbit.",
      });
      router.push("/admin/dashboard");
    } catch (error: any) {
      // Log detailed error for debugging purposes
      console.error("Auth Error Code:", error.code);
      console.error("Auth Error Message:", error.message);

      let errorMessage = "Authentication failed. Check credentials.";
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid credentials. Ensure user is created in Firebase Console.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Access restricted due to too many attempts.";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection.";
      }

      toast({
        variant: "destructive",
        title: "Access Denied",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black flex items-center justify-center p-6 overflow-hidden">
      <Starfield />
      
      <div className="absolute top-10 flex flex-col items-center gap-3">
        <PlanetLogo className="w-12 h-12 md:w-16 md:h-16 opacity-80" />
        <h1 className="text-[10px] md:text-sm tracking-[0.5em] md:tracking-[0.8em] text-white/40 uppercase font-black">
          Admin Portal
        </h1>
      </div>

      <Card className="login-card w-full max-w-md bg-black/60 backdrop-blur-2xl border-white/10 shadow-2xl relative z-10 rounded-none">
        <CardHeader className="text-center pt-10 pb-6 border-b border-white/10">
          <CardTitle className="text-xl md:text-2xl font-black tracking-[0.3em] md:tracking-[0.4em] text-white uppercase italic">
            STYLE MAVERIK
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8 md:pt-10">
          <form onSubmit={handleLogin} className="space-y-6 md:space-y-8">
            <div className="space-y-2">
              <Label className="text-[10px] tracking-[0.2em] uppercase text-accent font-bold">Admin Email</Label>
              <Input
                type="email"
                placeholder="admin@bryt.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-white/20 h-12 rounded-none focus:ring-accent/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] tracking-[0.2em] uppercase text-accent font-bold">Secure Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-white/20 h-12 rounded-none focus:ring-accent/40"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" className="border-white/40" />
              <label htmlFor="remember" className="text-[10px] tracking-[0.1em] text-white/60 uppercase font-medium cursor-pointer">
                Maintain Secure Session
              </label>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-white text-black hover:bg-accent hover:text-white transition-all duration-500 font-black tracking-[0.3em] rounded-none uppercase text-xs"
            >
              {loading ? "AUTHENTICATING..." : "ENTER COMMAND CENTER"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
