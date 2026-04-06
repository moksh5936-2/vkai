"use client";

import { useEffect, useState } from "react";
import AmbientBackground from "@/components/ui/AmbientBackground";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function LibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingItem, setLoadingItem] = useState<string | null>(null);

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

  const viewItem = async (id: string, cachedData?: any) => {
    if (cachedData) {
      setSelectedItem(cachedData);
      setIsModalOpen(true);
      return;
    }
    
    setLoadingItem(id);
    try {
      const res = await fetch(`/api/saved/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      
      // Cache the full data back into the items array to save future fetches
      setItems(items.map(i => i.id === id ? { ...i, ...data } : i));
      
      setSelectedItem(data);
      setIsModalOpen(true);
    } catch (err) {
      toast.error("Failed to open item");
    } finally {
      setLoadingItem(null);
    }
  };

  const downloadItem = async (item: any) => {
    try {
      // If we don't have the full data, fetch it first
      let fullItemData = item.data;
      if (!fullItemData) {
        setLoadingItem(item.id + "-download");
        const res = await fetch(`/api/saved/${item.id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        fullItemData = data.data;
        setItems(items.map(i => i.id === item.id ? { ...i, ...data } : i));
      }

      // Format data to a readable string based on what's stored
      let contentString = "";
      if (typeof fullItemData === "string") {
        contentString = fullItemData;
      } else if (typeof fullItemData === "object") {
        contentString = JSON.stringify(fullItemData, null, 2);
        // If it has a humanReadable fall back to it for better output
        if (fullItemData.humanReadable) {
           contentString = fullItemData.humanReadable + "\n\n---\n\n" + JSON.stringify(fullItemData.data || fullItemData, null, 2);
        }
      }

      const blob = new Blob([contentString], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Document downloaded!");
    } catch (err) {
      toast.error("Failed to download document");
    } finally {
      setLoadingItem(null);
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

  // Helper to safely render complex JSON objects in the modal
  const renderItemContent = (data: any) => {
    if (!data) return <p className="text-white/40">No data available.</p>;
    if (typeof data === "string") return <p className="whitespace-pre-wrap">{data}</p>;
    
    // Attempt to smartly render specialized structured objects if they exist
    if (data.humanReadable) {
      return (
        <div className="flex flex-col gap-6">
          <p className="whitespace-pre-wrap text-white/80">{data.humanReadable}</p>
          {data.data && (
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 overflow-auto">
              <pre className="text-xs text-[#00D4FF] whitespace-pre-wrap font-mono">
                {JSON.stringify(data.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-black/40 p-4 rounded-xl border border-white/5 overflow-auto">
        <pre className="text-xs text-[#00D4FF] whitespace-pre-wrap font-mono">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
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
                  title="Delete"
                >
                  ✕
                </button>
              </div>
              <h3 className="text-lg font-bold mb-2 line-clamp-1">{item.title}</h3>
              <p className="text-xs text-white/40 mb-6 uppercase tracking-widest font-bold">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-auto pt-4 border-t border-white/5 flex gap-3">
                <button 
                  onClick={() => viewItem(item.id, item.data ? item : undefined)}
                  className="btn-ghost flex-1 py-2 text-xs flex items-center justify-center gap-2"
                  disabled={loadingItem === item.id}
                >
                  {loadingItem === item.id ? <LoadingSpinner size="sm" /> : "View Result"}
                </button>
                <button 
                  onClick={() => downloadItem(item)}
                  disabled={loadingItem === item.id + "-download"}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#7B2FFF] text-white/40 hover:text-white transition-all disabled:opacity-50"
                  title="Download Data"
                >
                  {loadingItem === item.id + "-download" ? <LoadingSpinner size="sm" /> : "📥"}
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* View Result Modal */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[85vh] flex flex-col bg-[#0A0A0A] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <span className="text-3xl bg-white/5 p-3 rounded-2xl border border-white/10">
                    {getTypeIcon(selectedItem.type)}
                  </span>
                  <div>
                    <h2 className="text-2xl font-syne font-bold">{selectedItem.title}</h2>
                    <p className="text-xs uppercase tracking-widest text-white/40 font-bold mt-1">
                      {new Date(selectedItem.createdAt).toLocaleDateString()} • {selectedItem.type.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                {renderItemContent(selectedItem.data)}
              </div>

              <div className="p-6 border-t border-white/10 bg-black/40 shrink-0 flex justify-end gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="btn-ghost"
                >
                  Close
                </button>
                <button 
                  onClick={() => downloadItem(selectedItem)}
                  className="btn-primary"
                >
                  Download Export
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
