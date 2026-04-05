"use client";

import { useEffect, useState } from "react";
import AmbientBackground from "@/components/ui/AmbientBackground";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

export default function LibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/saved")
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(() => toast.error("Failed to load library"))
      .finally(() => setLoading(false));
  }, []);

  const deleteItem = async (id: string) => {
    try {
      await fetch(`/api/saved/${id}`, { method: "DELETE" });
      setItems(items.filter(i => i.id !== id));
      toast.success("Item removed from library");
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "VALIDATE_IDEA": return "🎯";
      case "GENERATE_PITCH_DECK": return "⚡";
      case "FINANCIAL_PROJECTIONS": return "📈";
      case "BUSINESS_MODEL": return "🏗️";
      default: return "💾";
    }
  };

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <AmbientBackground />
      <Navbar />

      <div className="mb-12">
        <h1 className="text-4xl font-syne font-extrabold tracking-tighter mb-2">My Library ✦</h1>
        <p className="text-white/40">Access all your saved AI insights and generated documents.</p>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="mt-20" />
      ) : items.length === 0 ? (
        <div className="py-40 text-center">
          <div className="text-6xl mb-6 opacity-20">🕳️</div>
          <p className="text-white/30 font-bold uppercase tracking-widest">Your library is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <GlassCard key={item.id} className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{getTypeIcon(item.type)}</span>
                <button 
                  onClick={() => deleteItem(item.id)}
                  className="text-white/20 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
              <h3 className="text-lg font-bold mb-2 line-clamp-1">{item.title}</h3>
              <p className="text-xs text-white/40 mb-6 uppercase tracking-widest font-bold">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-auto pt-4 border-t border-white/5 flex gap-3">
                <button className="btn-ghost flex-1 py-2 text-xs">View Result</button>
                <button className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#7B2FFF] text-white/40 hover:text-white transition-all">
                  📥
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </main>
  );
}
