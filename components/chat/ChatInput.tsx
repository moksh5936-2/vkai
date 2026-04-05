"use client";

import { useState, useRef, useEffect } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

interface ChatInputProps {
  onSend: (message: string, file?: any) => void;
  loading: boolean;
  credits: number;
}

export default function ChatInput({ onSend, loading, credits }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/chat/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFile(data);
      toast.success("File uploaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = () => {
    if (!message.trim() && !file) return;
    if (credits <= 0) {
      toast.error("Insufficient credits. Please upgrade.");
      return;
    }
    onSend(message, file);
    setMessage("");
    setFile(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 pb-6 pt-2">
      {file && (
        <div className="mb-4 flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-xs">
            📄
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate">{file.fileName}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">{file.fileType}</p>
          </div>
          <button onClick={() => setFile(null)} className="text-white/20 hover:text-white transition-colors">
            ✕
          </button>
        </div>
      )}

      <div className="relative group">
        <textarea
          ref={textareaRef}
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your startup strategy question..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-4 pl-14 pr-16 focus:outline-none focus:border-[#7B2FFF]/30 transition-all resize-none text-sm placeholder:text-white/20"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/5 text-white/30 hover:text-white transition-all disabled:opacity-50"
          disabled={uploading}
        >
          {uploading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

        <button
          onClick={handleSend}
          disabled={loading || (!message.trim() && !file)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-[#7B2FFF] to-[#FF3CAC] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold tracking-[2px] text-white/20 px-4">
        <span>Mistral AI Multimodal V4</span>
        <div className="flex items-center gap-2">
          {credits <= 2 && credits > 0 && <span className="text-[#FF3CAC]">Low Credits!</span>}
          {credits === 0 && <span className="text-red-500">Credits Exhausted</span>}
          <span>{credits} Credits Remaining</span>
        </div>
      </div>
    </div>
  );
}
