"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import GlassCard from "../ui/GlassCard";
import toast from "react-hot-toast";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  intent?: string;
  data?: any;
  generatedFile?: any;
}

export default function ChatMessage({ 
  role, content, intent, data, generatedFile 
}: ChatMessageProps) {
  const isUser = role === "user";

  const handleDownload = () => {
    if (!generatedFile) return;
    const blob = new Blob([generatedFile.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = generatedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("File downloaded!");
  };

  const handleBookmark = async () => {
    try {
      await fetch("/api/saved", {
        method: "POST",
        body: JSON.stringify({ 
          type: intent || "GENERAL", 
          title: data?.title || "AI Insight", 
          data 
        }),
      });
      toast.success("Result saved to library");
    } catch (err) {
      toast.error("Failed to save result");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-8`}
    >
      <div className={`max-w-[85%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        
        {/* Intent Badge */}
        {!isUser && intent && (
          <span className="text-[9px] font-black uppercase tracking-[3px] text-[#FF3CAC] mb-3 ml-1">
            ✦ {intent.replace(/_/g, ' ')}
          </span>
        )}

        <div
          className={`px-6 py-4 rounded-[28px] ${
            isUser
              ? "bg-gradient-to-br from-[#7B2FFF] to-[#7B2FFF]/80 text-white rounded-tr-sm"
              : "bg-white/[0.03] border border-white/5 text-white/90 rounded-tl-sm backdrop-blur-md"
          }`}
        >
           <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            components={{
              p: ({node, ...props}) => <p className="text-sm leading-relaxed prose prose-invert max-w-none mb-4 last:mb-0" {...props} />
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Structured Data Cards */}
        {!isUser && data && (
          <div className="mt-6 w-full space-y-4">
            
            {intent === "VALIDATE_IDEA" && (
              <GlassCard className="!p-8 bg-[#7B2FFF]/5 border-[#7B2FFF]/20">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="text-2xl font-syne font-extrabold mb-1">Viability Score</h4>
                    <p className="text-xs uppercase tracking-widest text-[#FF3CAC] font-bold">{data.marketSentiment} Sentiment</p>
                  </div>
                  <div className="w-20 h-20 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                    <svg className="absolute inset-0 -rotate-90">
                      <circle cx="40" cy="40" r="36" fill="none" stroke="#7B2FFF" strokeWidth="4" 
                        strokeDasharray={226} strokeDashoffset={226 - (226 * data.viabilityScore) / 100} />
                    </svg>
                    <span className="text-2xl font-syne font-extrabold">{data.viabilityScore}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <DataPill label="Competitive Edge" value={data.competitiveEdge} />
                  <DataPill label="Target Market" value={data.targetMarket} />
                </div>
              </GlassCard>
            )}

            {intent === "GENERATE_PITCH_DECK" && (
              <GlassCard className="bg-white/5">
                <h4 className="text-sm font-bold uppercase tracking-widest mb-6">Deck Architecture</h4>
                <div className="space-y-3">
                  {data.slides?.slice(0, 5).map((s: any) => (
                    <div key={s.slideNumber} className="p-3 bg-white/5 rounded-xl text-xs flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[#7B2FFF]/20 flex items-center justify-center font-bold text-[#7B2FFF]">
                        {s.slideNumber}
                      </span>
                      <span className="font-medium">{s.title}</span>
                    </div>
                  ))}
                  <button className="w-full py-2 text-[10px] uppercase font-bold text-white/30 hover:text-white transition-colors">
                    + {data.slides?.length - 5} More Slides
                  </button>
                </div>
              </GlassCard>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 ml-2">
              {generatedFile && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:border-[#7B2FFF]/50 transition-all"
                >
                  📥 Download Report
                </button>
              )}
              <button
                onClick={handleBookmark}
                className="p-2 rounded-full bg-white/5 border border-white/10 hover:text-[#FF3CAC] transition-colors"
                title="Save to Library"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DataPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
      <p className="text-[9px] uppercase font-bold text-white/30 tracking-[1.5px] mb-1">{label}</p>
      <p className="text-xs font-medium text-white/80 line-clamp-2">{value}</p>
    </div>
  );
}
