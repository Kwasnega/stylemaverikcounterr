
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, CheckCircle2, ShieldCheck, Mail, Loader2 } from "lucide-react";
import gsap from "gsap";
import { useToast } from "@/hooks/use-toast";
import { useDatabase, useRTDBList, useUser, useMemoFirebase } from "@/firebase";
import { ref } from "firebase/database";
import { sendLaunchEmails } from "@/app/actions/email-actions";

export default function EmailBlastPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  
  const rtdb = useDatabase();
  const waitlistRef = useMemoFirebase(() => rtdb ? ref(rtdb, "waitlist") : null, [rtdb]);
  const { data: entries } = useRTDBList(waitlistRef);
  const totalPioneers = entries?.length || 0;

  useEffect(() => {
    gsap.fromTo(".email-content", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power4.out", clearProps: "all" }
    );
  }, []);

  const handleSendBlast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    
    const sanitizedSubject = subject.trim();
    if (!sanitizedSubject || sanitizedSubject.length < 5) {
      toast({ variant: "destructive", title: "Validation Error", description: "Subject must be at least 5 characters." });
      return;
    }

    setIsSending(true);
    
    try {
      const result = await sendLaunchEmails(user.email);
      
      setIsSending(false);
      setSentCount(result.sent);
      toast({
        title: "Transmission Success",
        description: `Broadcast sent to ${result.sent} pioneers via Secure Gateway.`,
      });
      
      gsap.fromTo(".success-reveal", 
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: "back.out(1.7)", clearProps: "all" }
      );
    } catch (err: any) {
      setIsSending(false);
      toast({
        variant: "destructive",
        title: "Transmission Failed",
        description: err.message || "Failed to reach registry pioneers.",
      });
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 pb-20">
      <header className="space-y-4">
        <h2 className="text-4xl md:text-7xl font-black tracking-tight text-white uppercase italic drop-shadow-xl leading-none">Broadcast Center</h2>
        <p className="text-[12px] md:text-[18px] tracking-[0.2em] md:tracking-[0.4em] text-accent uppercase font-black">
          Direct Line to the Style Maverik fleet
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-12 email-content">
        <Card className="xl:col-span-2 bg-black border-2 md:border-4 border-white rounded-none shadow-2xl">
          <CardHeader className="pt-8 md:pt-10 px-6 md:px-10 border-b-2 border-white bg-white/5">
            <CardTitle className="text-[14px] md:text-[18px] tracking-[0.3em] md:tracking-[0.5em] text-white uppercase font-black">Compose Interstellar Message</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-10 space-y-8 md:space-y-10 bg-black">
            <form onSubmit={handleSendBlast} className="space-y-8 md:space-y-12">
              <div className="space-y-3 md:space-y-4">
                <Label className="text-[10px] md:text-[14px] tracking-[0.2em] md:tracking-[0.4em] uppercase text-accent font-black">Subject Line</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject: The New World is Calling..."
                  required
                  className="bg-zinc-900 border-2 md:border-4 border-white text-white placeholder:text-white/20 h-16 md:h-24 rounded-none focus:ring-accent focus:border-accent text-lg md:text-2xl font-black px-6 md:px-8"
                />
              </div>
              
              <div className="space-y-3 md:space-y-4">
                <Label className="text-[10px] md:text-[14px] tracking-[0.2em] md:tracking-[0.4em] uppercase text-accent font-black">Message Body</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Note: For the official launch, the system uses the premium HTML template. Custom manual emails are currently in draft."
                  required
                  className="min-h-[300px] md:min-h-[450px] bg-zinc-900 border-2 md:border-4 border-white text-white placeholder:text-white/20 rounded-none focus:ring-accent focus:border-accent text-lg md:text-2xl leading-relaxed p-6 md:p-10 font-black"
                />
              </div>

              <Button
                type="submit"
                disabled={isSending}
                className="w-full h-20 md:h-28 bg-white text-black hover:bg-accent hover:text-white transition-all duration-700 font-black tracking-[0.4em] md:tracking-[0.6em] rounded-none uppercase text-base md:text-lg border-none shadow-2xl"
              >
                {isSending ? "TRANSMITTING..." : "INITIATE BROADCAST"}
                {isSending ? <Loader2 className="animate-spin w-6 h-6 md:w-8 md:h-8 ml-4 md:ml-8" /> : <Send className="w-6 h-6 md:w-8 md:h-8 ml-4 md:ml-8" />}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6 md:space-y-8">
          <Card className="bg-black border-2 md:border-4 border-white rounded-none p-8 md:p-10 shadow-2xl">
            <h3 className="text-[14px] md:text-[16px] tracking-[0.3em] md:tracking-[0.4em] text-accent uppercase font-black mb-8 md:mb-10 border-b-2 border-accent pb-4 md:pb-6 flex items-center gap-4">
              <Mail className="w-5 h-5 md:w-6 md:h-6" />
              Target Audience
            </h3>
            <div className="space-y-6 md:space-y-8">
              <div className="flex justify-between items-center py-4 md:py-6 border-b-2 border-white/10">
                <span className="text-sm md:text-base text-white tracking-[0.1em] font-black uppercase">Total Pioneers</span>
                <span className="text-4xl md:text-6xl font-black text-white italic drop-shadow-xl">{totalPioneers.toLocaleString()}</span>
              </div>
              
              <div className="mt-8 md:mt-12 bg-accent/10 border-2 border-accent p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="flex items-center gap-3 md:gap-4 text-accent">
                  <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-[12px] md:text-[14px] font-black tracking-[0.2em] uppercase">Gateway: Secure</span>
                </div>
                <p className="text-[10px] md:text-[11px] text-white/80 font-black italic tracking-[0.1em] leading-relaxed">
                  * ALL TRANSMISSIONS ARE ENCRYPTED AND ROUTED THROUGH THE GOOGLE CLOUD RELAY FOR 100% DELIVERY VELOCITY.
                </p>
              </div>
            </div>
          </Card>

          {sentCount !== null && (
            <div className="success-reveal bg-accent border-4 md:border-8 border-white p-8 md:p-12 flex flex-col items-center text-center space-y-6 md:space-y-8 shadow-[0_0_80px_rgba(85,214,247,0.4)]">
              <CheckCircle2 className="w-16 h-16 md:w-24 md:h-24 text-black" />
              <h4 className="text-2xl md:text-4xl font-black tracking-[0.2em] text-black uppercase italic leading-none">MISSION COMPLETE</h4>
              <p className="text-sm md:text-[18px] tracking-[0.3em] text-black uppercase font-black">
                RECEIVED BY {sentCount.toLocaleString()} UNITS
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
