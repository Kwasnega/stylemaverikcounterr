
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Globe, Zap, ShieldCheck, Image as ImageIcon, Loader2, Upload, Cloud, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDatabase, useRTDBObject, useMemoFirebase } from "@/firebase";
import { ref, set } from "firebase/database";
import gsap from "gsap";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const rtdb = useDatabase();
  const launchRef = useMemoFirebase(() => rtdb ? ref(rtdb, "settings/launch") : null, [rtdb]);
  const { data: launchData } = useRTDBObject(launchRef);
  
  const galleryRef = useMemoFirebase(() => rtdb ? ref(rtdb, "settings/gallery") : null, [rtdb]);
  const { data: galleryData } = useRTDBObject(galleryRef);

  const brandRef = useMemoFirebase(() => rtdb ? ref(rtdb, "settings/brand") : null, [rtdb]);
  const { data: brandData } = useRTDBObject(brandRef);

  const cloudRef = useMemoFirebase(() => rtdb ? ref(rtdb, "settings/cloudinary") : null, [rtdb]);
  const { data: cloudData } = useRTDBObject(cloudRef);
  
  const [launchDate, setLaunchDate] = useState("");
  const [launchStarted, setLaunchStarted] = useState(false);
  const [isUpdatingTimeline, setIsUpdatingTimeline] = useState(false);
  
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [cloudName, setCloudName] = useState("dhaqkp0rb");
  const [uploadPreset, setUploadPreset] = useState("styemaverik");

  const { toast } = useToast();

  useEffect(() => {
    if (launchData?.launchDate) {
      const date = new Date(launchData.launchDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      setLaunchDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    }
    if (launchData?.isLaunched) setLaunchStarted(true);
  }, [launchData]);

  useEffect(() => {
    if (cloudData) {
      setCloudName(cloudData.cloudName || "dhaqkp0rb");
      setUploadPreset(cloudData.uploadPreset || "styemaverik");
    }
  }, [cloudData]);

  const handleUpdateCloudinary = () => {
    if (!rtdb) return;
    set(ref(rtdb, "settings/cloudinary"), { cloudName, uploadPreset })
      .then(() => toast({ title: "Cloudinary Configured", description: "Media gateway updated." }))
      .catch(() => toast({ variant: "destructive", title: "Error", description: "Could not save config." }));
  };

  const uploadToCloudinary = async (file: File) => {
    if (!cloudName || !uploadPreset) {
      toast({ variant: "destructive", title: "Config Error", description: "Please ensure Cloudinary Cloud Name and Upload Preset are set." });
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) return data.secure_url;
      throw new Error(data.error?.message || "Upload failed");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: error.message });
      return null;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: string) => {
    const file = e.target.files?.[0];
    if (!file || !rtdb) return;

    setIsUploading(target);
    const url = await uploadToCloudinary(file);
    
    if (url) {
      if (target === "logo") {
        set(ref(rtdb, "settings/brand"), { ...brandData, logoUrl: url });
      } else {
        const key = target === "img1" ? "img1" : target === "img2" ? "img2" : "img3";
        set(ref(rtdb, "settings/gallery"), { ...galleryData, [key]: url });
      }
      toast({ title: "Media Updated", description: "Asset successfully deployed to orbit." });
    }
    setIsUploading(null);
  };

  const handleUpdateLaunchDate = () => {
    if (!rtdb || !launchDate) return;
    setIsUpdatingTimeline(true);
    set(ref(rtdb, "settings/launch"), { ...launchData, launchDate: new Date(launchDate).toISOString() })
      .then(() => toast({ title: "Timeline Updated", description: "Orbit synchronized." }))
      .finally(() => setIsUpdatingTimeline(false));
  };

  const handleLaunch = () => {
    if (window.confirm("INITIATE IGNITION? This will open the gateway to the new world.") && rtdb) {
      set(ref(rtdb, "settings/launch"), { ...launchData, isLaunched: true })
        .then(() => {
          setLaunchStarted(true);
          toast({ title: "IGNITION STARTED", description: "Style Maverik is now live." });
          gsap.to(".launch-overlay", { opacity: 1, duration: 1, display: "flex" });
        });
    }
  };

  return (
    <div className="space-y-8 md:space-y-12 relative pb-20">
      <div className="launch-overlay fixed inset-0 z-[100] bg-white hidden items-center justify-center flex-col pointer-events-none opacity-0">
        <h1 className="text-black text-4xl md:text-9xl font-black tracking-[0.3em] uppercase italic">LAUNCHED</h1>
      </div>

      <header className="space-y-4">
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase italic drop-shadow-xl leading-none">Media Command Center</h2>
        <p className="text-[12px] md:text-[14px] tracking-[0.2em] md:tracking-[0.4em] text-accent uppercase font-black">Cloudinary Asset Management</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        <Card className="bg-white/5 border-2 border-white/20 backdrop-blur-3xl rounded-none shadow-2xl">
          <CardHeader className="pt-8 md:pt-10 px-6 md:px-10 border-b border-white/10">
            <CardTitle className="text-[12px] md:text-[14px] tracking-[0.3em] md:tracking-[0.5em] text-white uppercase font-black flex items-center gap-4">
              <Cloud className="w-5 h-5 text-accent" />
              Cloudinary Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-10 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-white/60 font-black">Cloud Name</Label>
                <Input value={cloudName} onChange={(e) => setCloudName(e.target.value)} placeholder="e.g. dhaqkp0rb" className="bg-white/10 border-white/20 text-white rounded-none h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-white/60 font-black">Upload Preset (Unsigned)</Label>
                <Input value={uploadPreset} onChange={(e) => setUploadPreset(e.target.value)} placeholder="e.g. styemaverik" className="bg-white/10 border-white/20 text-white rounded-none h-12" />
              </div>
              <Button onClick={handleUpdateCloudinary} className="w-full h-12 bg-white text-black hover:bg-accent hover:text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-none transition-all">
                Save Media Gateway
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-2 border-white/20 backdrop-blur-3xl rounded-none shadow-2xl">
          <CardHeader className="pt-8 md:pt-10 px-6 md:px-10 border-b border-white/10">
            <CardTitle className="text-[12px] md:text-[14px] tracking-[0.3em] md:tracking-[0.5em] text-white uppercase font-black flex items-center gap-4">
              <ImageIcon className="w-5 h-5 text-accent" />
              Brand Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-10 space-y-6">
            <div className="flex flex-col items-center gap-6">
              {brandData?.logoUrl ? (
                <div className="relative w-32 h-32 bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                  <img src={brandData.logoUrl} alt="Logo Preview" className="max-w-[85%] max-h-[85%] object-contain p-4" />
                </div>
              ) : (
                <div className="w-32 h-32 bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white/20" />
                </div>
              )}
              <div className="w-full">
                <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "logo")} disabled={isUploading === "logo"} className="hidden" id="logo-upload" />
                <Label htmlFor="logo-upload" className="w-full h-14 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-4 cursor-pointer font-black uppercase tracking-[0.2em] text-[10px] transition-all border border-white/20">
                  {isUploading === "logo" ? <Loader2 className="animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading === "logo" ? "UPLOADING..." : "UPLOAD NEW LOGO"}
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        <Card className="bg-white/5 border-2 border-white/20 backdrop-blur-3xl rounded-none shadow-2xl">
          <CardHeader className="pt-8 md:pt-10 px-6 md:px-10 border-b border-white/10">
            <CardTitle className="text-[12px] md:text-[14px] tracking-[0.3em] md:tracking-[0.5em] text-white uppercase font-black">Mission Timeline</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-10 space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] tracking-[0.2em] uppercase text-accent font-black">Target Date & Time</Label>
              <Input type="datetime-local" value={launchDate} onChange={(e) => setLaunchDate(e.target.value)} disabled={isUpdatingTimeline} className="bg-white/10 border-white/20 text-white rounded-none h-14 font-black" />
              <Button onClick={handleUpdateLaunchDate} disabled={isUpdatingTimeline} className="w-full h-14 bg-white text-black hover:bg-accent font-black uppercase tracking-[0.3em] text-[10px] rounded-none">
                {isUpdatingTimeline ? <Loader2 className="animate-spin mr-2" /> : null}
                {isUpdatingTimeline ? "SYNCHRONIZING..." : "Update Timeline"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-2 border-destructive/30 backdrop-blur-3xl rounded-none shadow-2xl">
          <CardHeader className="pt-8 md:pt-10 px-6 md:px-10 border-b border-destructive/10">
            <CardTitle className="text-[12px] md:text-[14px] tracking-[0.3em] md:tracking-[0.5em] text-destructive uppercase font-black">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-10 space-y-8">
            <p className="text-sm text-white/80 italic font-black bg-black/40 p-6 border border-white/5">Final ignition will notify all pioneers and open the gateway. Irreversible protocol.</p>
            <Button onClick={handleLaunch} disabled={launchStarted} className="w-full h-20 bg-destructive text-white hover:bg-white hover:text-black font-black tracking-[0.4em] rounded-none uppercase text-xs">
              <Rocket className="w-6 h-6 mr-4" />
              {launchStarted ? "MISSION COMPLETE" : "INITIATE IGNITION"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-2 border-white/20 backdrop-blur-3xl rounded-none shadow-2xl">
        <CardHeader className="pt-8 md:pt-10 px-6 md:px-10 border-b border-white/10 bg-white/5">
          <CardTitle className="text-[12px] md:text-[14px] tracking-[0.3em] md:tracking-[0.5em] text-white uppercase font-black">Success Gallery Command</CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {["img1", "img2", "img3"].map((id) => (
              <div key={id} className="space-y-4">
                <Label className="text-[10px] tracking-[0.2em] uppercase text-accent font-black">Success Card {id.slice(-1)}</Label>
                <div className="relative aspect-[3/4] bg-white/5 border border-white/10 overflow-hidden group">
                  {galleryData?.[id] ? (
                    <img src={galleryData[id]} alt={`Success ${id.slice(-1)}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, id)} disabled={!!isUploading} className="hidden" id={`upload-${id}`} />
                    <Label htmlFor={`upload-${id}`} className="cursor-pointer bg-white text-black p-3 rounded-full hover:bg-accent transition-colors">
                      {isUploading === id ? <Loader2 className="animate-spin" /> : <Upload className="w-5 h-5" />}
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
