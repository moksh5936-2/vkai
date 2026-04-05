"use client";

import { useEffect, useState } from "react";
import AmbientBackground from "@/components/ui/AmbientBackground";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const TYPES = ["ALL", "INVESTOR", "INCUBATOR", "CONSULTANT", "BANK"];

export default function EcosystemPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchMembers();
  }, [filter]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const url = `/api/ecosystem${filter !== "ALL" ? `?type=${filter}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setMembers(data.members || []);
    } catch (err) {
      toast.error("Failed to load ecosystem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <AmbientBackground />
      <Navbar />

      <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-syne font-extrabold tracking-tighter mb-2">Startup Ecosystem ✦</h1>
          <p className="text-white/40 font-medium">Connect with verified partners to accelerate your growth.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full border border-white/5 overflow-x-auto scrollbar-hide">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all ${
                filter === t ? "bg-[#7B2FFF] text-white shadow-lg" : "text-white/40 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="mt-20" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m) => (
            <GlassCard key={m.id} className="flex flex-col h-full !p-8">
              <div className="flex items-center justify-between mb-6">
                <span className={`badge-${m.type === 'INVESTOR' ? 'pink' : m.type === 'INCUBATOR' ? 'purple' : 'cyan'}`}>
                  {m.type}
                </span>
                {m.isVerified && (
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
              <h3 className="text-xl font-syne font-bold mb-3">{m.name}</h3>
              <p className="text-sm text-white/50 leading-relaxed mb-8 flex-1">
                {m.description || "Join the network and accelerate your startup journey with our expert ecosystem partners."}
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <a 
                  href={m.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 text-center py-3 text-xs"
                >
                  Visit Website
                </a>
                <button className="btn-ghost py-3 px-6 text-xs font-bold">
                  Contact
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </main>
  );
}
