
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Clock, TrendingUp, Send, Loader2 } from "lucide-react";
import gsap from "gsap";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { useUser, useDatabase, useRTDBObject, useRTDBList, useMemoFirebase } from "@/firebase";
import { ref } from "firebase/database";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendLaunchEmails } from "@/app/actions/email-actions";

export default function DashboardPage() {
  const { user } = useUser();
  const rtdb = useDatabase();
  const { toast } = useToast();
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  // RTDB Reference for Waitlist
  const waitlistRef = useMemoFirebase(() => rtdb ? ref(rtdb, "waitlist") : null, [rtdb]);
  const { data: entries } = useRTDBList(waitlistRef);
  
  // RTDB Reference for Launch Settings
  const launchRef = useMemoFirebase(() => rtdb ? ref(rtdb, "settings/launch") : null, [rtdb]);
  const { data: launchData } = useRTDBObject(launchRef);

  const totalPioneers = entries?.length || 0;
  
  const todaySignups = useMemo(() => {
    if (!entries) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return entries.filter(e => {
      const date = e.timestamp ? new Date(e.timestamp) : new Date();
      return date >= today;
    }).length;
  }, [entries]);

  const daysToLaunch = useMemo(() => {
    if (!launchData?.launchDate) return 0;
    const target = new Date(launchData.launchDate).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [launchData]);

  const handleInitiateLaunch = async () => {
    if (!user?.email) return;
    if (!confirm("INITIATE LAUNCH BROADCAST?")) return;

    setIsBroadcasting(true);
    try {
      const result = await sendLaunchEmails(user.email);
      toast({
        title: "Transmission Complete",
        description: `Successfully reached ${result.sent} pioneers.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Broadcast Failure",
        description: err.message || "Failed to initiate transmission.",
      });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const chartData = useMemo(() => {
    if (!entries || entries.length === 0) {
      return [{ name: "Orbit", signups: 0 }];
    }
    const countsByDate: Record<string, number> = {};
    entries.forEach(entry => {
      const dateObj = entry.timestamp ? new Date(entry.timestamp) : new Date();
      const dateKey = dateObj.toISOString().split('T')[0];
      countsByDate[dateKey] = (countsByDate[dateKey] || 0) + 1;
    });
    const sortedDates = Object.keys(countsByDate).sort();
    let runningTotal = 0;
    const data = sortedDates.map(date => {
      runningTotal += countsByDate[date];
      const [, month, day] = date.split('-');
      return { name: `${month}/${day}`, signups: runningTotal };
    });
    return data.slice(-10);
  }, [entries]);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(".dashboard-header", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1, ease: "power3.out" })
      .fromTo(".metric-card", { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: "power2.out" }, "-=0.6");
  }, []);

  const metricItems = [
    { label: "Total Pioneers", value: totalPioneers, icon: Users },
    { label: "New Entries", value: todaySignups, icon: UserPlus },
    { label: "Launch T-Minus", value: `${daysToLaunch}d`, icon: Clock },
    { label: "System Status", value: "Active", icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 md:space-y-12 pb-20">
      <header className="dashboard-header flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-8xl font-black tracking-tight text-white uppercase italic drop-shadow-xl leading-none">Command Center</h2>
          <p className="text-[14px] md:text-[24px] tracking-[0.5em] text-accent uppercase font-black">Orbital Telemetry Feed</p>
        </div>
        <Button onClick={handleInitiateLaunch} disabled={isBroadcasting} className="h-16 md:h-20 px-8 bg-white text-black hover:bg-accent hover:text-white rounded-none border-none font-black tracking-[0.3em] uppercase transition-all duration-500 shadow-2xl">
          {isBroadcasting ? <Loader2 className="animate-spin mr-3" /> : <Send className="w-6 h-6 mr-4" />}
          {isBroadcasting ? "Transmitting..." : "Initiate Launch Broadcast"}
        </Button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {metricItems.map((item, i) => (
          <Card key={i} className="metric-card bg-black border-2 md:border-4 border-white rounded-none shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 bg-white/5 border-b border-white/20">
              <span className="text-[10px] md:text-[12px] tracking-[0.3em] text-white/80 font-black uppercase">{item.label}</span>
              <item.icon className="w-5 h-5 md:w-6 md:h-6 text-accent" />
            </CardHeader>
            <CardContent className="pt-6 md:pt-8 pb-8 md:pb-10 bg-black text-5xl md:text-8xl font-black tracking-tighter text-white">
              {item.value}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="chart-section bg-black border-2 md:border-4 border-white rounded-none p-6 md:p-12 shadow-2xl">
        <CardHeader className="px-0 pt-0 mb-8 md:mb-10 border-b-2 border-white pb-6 bg-black">
          <CardTitle className="text-xl md:text-3xl tracking-[0.4em] text-white uppercase font-black flex items-center gap-4">
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-accent" /> Growth Velocity
          </CardTitle>
        </CardHeader>
        <div className="h-[300px] md:h-[500px] w-full">
          <ChartContainer config={{ signups: { label: "Pioneers", color: "hsl(var(--accent))" } }}>
            <LineChart data={chartData}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" strokeDasharray="5 5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "900" }} dy={15} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "900" }} />
              <ChartTooltip content={<ChartTooltipContent className="bg-black border-2 border-accent text-white font-black" />} />
              <Line type="monotone" dataKey="signups" stroke="hsl(var(--accent))" strokeWidth={4} dot={{ r: 4, fill: "hsl(var(--accent))" }} />
            </LineChart>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
}
