"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

interface Session {
  id: string;
  title: string;
  updatedAt: string;
}

export default function ChatSidebar() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/chat/sessions");
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const res = await fetch("/api/chat/sessions", { method: "POST" });
      const data = await res.json();
      setSessions([data, ...sessions]);
      router.push(`/dashboard/chat?id=${data.id}`);
    } catch (err) {
      toast.error("Failed to create chat");
    }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" });
      setSessions(sessions.filter((s) => s.id !== id));
      if (pathname.includes(id)) router.push("/dashboard/chat");
      toast.success("Chat deleted");
    } catch (err) {
      toast.error("Failed to delete chat");
    }
  };

  return (
    <div className="w-[280px] h-full border-r border-white/5 bg-black/40 flex flex-col pt-24 pb-6 px-4">
      <button
        onClick={createNewChat}
        className="btn-primary w-full py-3 mb-8 text-sm font-bold flex items-center justify-center gap-2"
      >
        <span>+</span> New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
        {loading ? (
          <LoadingSpinner size="sm" className="mt-20" />
        ) : (
          sessions.map((s) => {
            const isActive = pathname.includes(s.id);
            return (
              <Link
                key={s.id}
                href={`/dashboard/chat?id=${s.id}`}
                className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all border ${
                  isActive 
                    ? "bg-[#7B2FFF]/10 border-[#7B2FFF]/20 text-white" 
                    : "bg-transparent border-transparent text-white/40 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-lg">💬</span>
                <span className="flex-1 text-xs font-medium truncate tracking-tight">
                  {s.title || "New Chat"}
                </span>
                <button
                  onClick={(e) => deleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </Link>
            );
          })
        )}
      </div>

      <div className="pt-4 border-t border-white/5">
        <Link 
          href="/dashboard/profile"
          className="flex items-center gap-3 p-2 rounded-xl text-white/40 hover:text-white transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B2FFF] to-[#FF3CAC]" />
          <span className="text-xs font-bold uppercase tracking-widest">My Account</span>
        </Link>
      </div>
    </div>
  );
}
