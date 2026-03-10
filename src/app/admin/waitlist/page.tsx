
"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";
import { useDatabase, useRTDBList, useMemoFirebase } from "@/firebase";
import { ref } from "firebase/database";
import gsap from "gsap";

export default function WaitlistPage() {
  const rtdb = useDatabase();
  const [searchTerm, setSearchTerm] = useState("");
  
  const waitlistRef = useMemoFirebase(() => rtdb ? ref(rtdb, "waitlist") : null, [rtdb]);
  const { data: entries, loading } = useRTDBList(waitlistRef);

  useEffect(() => {
    gsap.fromTo(".table-container", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
  }, []);

  const filteredEntries = useMemo(() => entries?.filter(entry => 
    entry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [], [entries, searchTerm]);

  const handleExportCSV = () => {
    if (!filteredEntries.length) return;
    const headers = ["Name", "Email", "Timestamp"];
    const csvContent = [
      headers.join(","),
      ...filteredEntries.map(e => `"${e.name}","${e.email}","${e.timestamp ? new Date(e.timestamp).toLocaleString() : ''}"`)
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `maverik-fleet-registry.csv`;
    link.click();
  };

  return (
    <div className="space-y-8 md:space-y-12">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-7xl font-black tracking-tight text-white uppercase italic drop-shadow-xl leading-none">Waitlist Registry</h2>
          <p className="text-[12px] md:text-[16px] tracking-[0.4em] text-accent uppercase font-black">Managing the explorers awaiting entry</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
            <input 
              placeholder="Search Pioneers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 md:h-16 pl-14 pr-6 bg-black/60 border-2 border-white/60 text-white placeholder:text-white/40 rounded-none focus:ring-accent focus:border-accent text-xs font-black uppercase tracking-widest outline-none transition-all"
            />
          </div>
          <Button onClick={handleExportCSV} className="bg-white text-black hover:bg-accent hover:text-white h-14 md:h-16 rounded-none px-10 font-black tracking-[0.2em] uppercase text-[10px] transition-all duration-500 shadow-2xl border-none">
            <Download className="w-4 h-4 mr-3" /> Export Registry
          </Button>
        </div>
      </header>

      <div className="table-container bg-black border-2 md:border-4 border-white rounded-none shadow-2xl overflow-x-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="bg-white/5 border-b-2 border-white">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[14px] tracking-[0.3em] uppercase text-white font-black h-16 md:h-20 px-8 md:px-10">Pioneer Name</TableHead>
                <TableHead className="text-[14px] tracking-[0.3em] uppercase text-white font-black h-16 md:h-20">Contact Email</TableHead>
                <TableHead className="text-[14px] tracking-[0.3em] uppercase text-white font-black h-16 md:h-20">Orbit Entry</TableHead>
                <TableHead className="text-[14px] tracking-[0.3em] uppercase text-white font-black h-16 md:h-20 text-right px-8 md:px-10">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-64 text-center text-white tracking-[0.3em] uppercase text-lg font-black animate-pulse">Scanning Orbit...</TableCell></TableRow>
              ) : filteredEntries.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="h-64 text-center text-white tracking-[0.3em] uppercase text-lg font-black">No pioneers detected</TableCell></TableRow>
              ) : (
                filteredEntries.map((entry, i) => (
                  <TableRow key={i} className="group border-white/10 hover:bg-white/5 transition-colors border-b last:border-none h-20 md:h-24">
                    <TableCell className="px-8 md:px-10 py-4 font-black text-white text-lg md:text-xl tracking-tight">{entry.name}</TableCell>
                    <TableCell className="text-white text-base md:text-lg tracking-tight font-black">{entry.email}</TableCell>
                    <TableCell className="text-white/60 text-xs tracking-widest font-mono font-black italic">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Scanning...'}</TableCell>
                    <TableCell className="text-right px-8 md:px-10"><span className="text-[9px] tracking-[0.1em] uppercase font-black text-accent bg-accent/10 px-4 py-2 border border-accent/40 inline-block">Confirmed</span></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
