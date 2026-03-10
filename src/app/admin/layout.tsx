"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Send, Settings, LogOut, Menu, X, ChevronLeft, Loader2 } from "lucide-react";
import Starfield from "@/components/splash/Starfield";
import PlanetLogo from "@/components/splash/PlanetLogo";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Waitlist", href: "/admin/waitlist", icon: Users },
  { name: "Email Blast", href: "/admin/email", icon: Send },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

interface SidebarContentProps {
  pathname: string;
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  handleLogout: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const SidebarContent = ({ pathname, isSidebarOpen, isMobileMenuOpen, handleLogout, setSidebarOpen }: SidebarContentProps) => (
  <div className="flex flex-col h-full">
    <div className="h-20 md:h-24 flex items-center px-6 gap-4 border-b border-white/10">
      <PlanetLogo className="w-8 h-8 flex-shrink-0" />
      {(isSidebarOpen || isMobileMenuOpen) && (
        <span className="text-[10px] font-black tracking-[0.3em] uppercase italic text-white whitespace-nowrap">
          STYLE MAVERIK
        </span>
      )}
    </div>

    <nav className="flex-1 py-8 md:py-10 space-y-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-6 h-14 gap-4 transition-all duration-300 relative group",
              isActive ? "text-accent bg-white/5" : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            {isActive && (
              <div className="absolute left-0 w-1 h-full bg-accent shadow-[0_0_15px_rgba(85,214,247,0.8)]" />
            )}
            <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-accent" : "")} />
            {(isSidebarOpen || isMobileMenuOpen) && (
              <span className="text-[11px] font-black tracking-[0.2em] uppercase">
                {item.name}
              </span>
            )}
          </Link>
        );
      })}
    </nav>

    <div className="p-4 border-t border-white/10 space-y-2">
      <button
        onClick={handleLogout}
        className="w-full flex items-center px-4 h-12 gap-4 text-white/60 hover:text-destructive transition-colors group"
      >
        <LogOut className="w-5 h-5 flex-shrink-0" />
        {(isSidebarOpen || isMobileMenuOpen) && (
          <span className="text-[11px] font-black tracking-[0.2em] uppercase">Logout</span>
        )}
      </button>
      <div className="hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          className="w-full h-12 text-white/40 hover:text-white hover:bg-white/5 transition-all"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
        </Button>
      </div>
    </div>
  </div>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [user, isLoading, router, pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/admin/login");
    }
  };

  // Unified rendering to prevent hook violations and black screens
  return (
    <div className="min-h-screen bg-black text-white font-body overflow-x-hidden selection:bg-accent/30 relative">
      <Starfield />
      
      {isLoading ? (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-8 p-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 blur-[60px] animate-pulse" />
            <PlanetLogo className="w-32 h-32 md:w-48 md:h-48 relative z-10" />
          </div>
          <div className="space-y-4">
            <h2 className="text-white text-xl md:text-2xl font-black tracking-[0.4em] uppercase italic drop-shadow-xl">
              STYLE MAVERIK
            </h2>
            <div className="flex items-center justify-center gap-4 text-accent/60 tracking-[0.6em] font-black uppercase text-[10px] md:text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning Orbit...
            </div>
          </div>
        </div>
      ) : pathname === "/admin/login" ? (
        <div className="relative z-10">{children}</div>
      ) : !user ? (
        <div className="min-h-screen flex flex-col items-center justify-center text-accent/60 tracking-[0.6em] font-black uppercase text-xs">
          Redirecting to Gateway...
        </div>
      ) : (
        <>
          {/* Desktop Sidebar */}
          <aside 
            className={cn(
              "fixed top-0 left-0 h-full z-50 bg-black/80 backdrop-blur-3xl border-r border-white/10 transition-all duration-500 ease-in-out hidden md:block",
              isSidebarOpen ? "w-64" : "w-20"
            )}
          >
            <SidebarContent 
              pathname={pathname}
              isSidebarOpen={isSidebarOpen}
              isMobileMenuOpen={isMobileMenuOpen}
              handleLogout={handleLogout}
              setSidebarOpen={setSidebarOpen}
            />
          </aside>

          {/* Mobile Navbar */}
          <div className="fixed top-0 left-0 w-full h-20 z-[60] bg-black/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 md:hidden">
            <div className="flex items-center gap-3">
              <PlanetLogo className="w-8 h-8" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase italic text-white">COMMAND CENTER</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>

          {/* Mobile Navigation Overlay */}
          <div 
            className={cn(
              "fixed inset-0 z-[100] bg-black/95 transition-transform duration-500 ease-in-out md:hidden",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="absolute top-6 right-6">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={32} />
              </Button>
            </div>
            <SidebarContent 
              pathname={pathname}
              isSidebarOpen={isSidebarOpen}
              isMobileMenuOpen={isMobileMenuOpen}
              handleLogout={handleLogout}
              setSidebarOpen={setSidebarOpen}
            />
          </div>

          {/* Main Mission Content */}
          <main 
            className={cn(
              "transition-all duration-500 ease-in-out min-h-screen pt-28 md:pt-24 pb-12 px-6 md:px-8 relative z-10",
              "md:ml-20",
              isSidebarOpen && "md:ml-64"
            )}
          >
            <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
              {children}
            </div>
          </main>
        </>
      )}
    </div>
  );
}