"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessage from "@/components/chat/ChatMessage";
import AmbientBackground from "@/components/ui/AmbientBackground";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useCredits } from "@/hooks/useCredits";
import Navbar from "@/components/Navbar";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");
  const { credits, fetchCredits } = useCredits();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionId) {
      fetchMessages(sessionId);
    } else {
      setMessages([]);
    }
  }, [sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async (id: string) => {
    setInitialLoading(true);
    try {
      const res = await fetch(`/api/chat/sessions/${id}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSend = async (message: string, attachment?: any) => {
    setLoading(true);
    // Add user message optimistically
    const userMsg = { role: "user", content: message, attachment };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message, sessionId, attachment }),
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      // Add AI response
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.data.humanReadable,
        intent: data.data.intent,
        data: data.data.data,
        generatedFile: data.data.generatedFile,
      }]);

      // Refresh credits
      fetchCredits();
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="h-screen flex bg-[#0A0A0A] overflow-hidden">
      <AmbientBackground />
      <Navbar />
      
      <ChatSidebar />

      <div className="flex-1 flex flex-col pt-24 relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar space-y-2"
        >
          {initialLoading ? (
            <div className="h-full flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-8">
                🤖
              </div>
              <h2 className="text-2xl font-syne font-extrabold mb-4 tracking-tighter">
                How can I build your vision today?
              </h2>
              <p className="text-white/40 text-sm leading-relaxed mb-12">
                Ask me to validate an idea, generate a pitch deck, or map out your financial 3-year roadmap.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <QuickPrompt onClick={() => handleSend("Validate my AI SaaS idea for healthcare.")} text="Validate Healthcare AI" />
                <QuickPrompt onClick={() => handleSend("Generate a pitch deck for a fintech startup.")} text="Pitch Deck for Fintech" />
                <QuickPrompt onClick={() => handleSend("What are the key risks for a consumer social app?")} text="Risk Analysis" />
                <QuickPrompt onClick={() => handleSend("Find me top incubators in Southeast Asia.")} text="Find Incubators" />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full">
              {messages.map((m, i) => (
                <ChatMessage 
                  key={i} 
                  role={m.role} 
                  content={m.content} 
                  intent={m.intent}
                  data={m.data ? (typeof m.data === 'string' ? JSON.parse(m.data) : m.data) : null}
                  generatedFile={m.generatedFile}
                />
              ))}
              {loading && (
                <div className="flex justify-start mb-8 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <LoadingSpinner size="sm" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <ChatInput 
          onSend={handleSend} 
          loading={loading} 
          credits={credits?.credits?.chatCredits - credits?.credits?.chatCreditsUsed || 0} 
        />
      </div>
    </main>
  );
}

function QuickPrompt({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white hover:border-white/10 hover:bg-white/5 transition-all text-left"
    >
      {text} ✦
    </button>
  );
}
