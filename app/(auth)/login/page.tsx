"use client";

import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import AmbientBackground from "@/components/ui/AmbientBackground";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, loading, error } = useFirebaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signInWithEmail(email, password);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative">
      <AmbientBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full p-12 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-2xl"
      >
        <div className="text-center mb-10">
          <Link href="/" className="font-syne text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-[#7B2FFF] to-[#FF3CAC] bg-clip-text text-transparent inline-block mb-8">
            VK-AI
          </Link>
          <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
          <p className="text-white/40 text-sm">Sign in to your founder dashboard.</p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <button
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-white text-black font-bold text-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign in with Google
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black/20 px-4 text-white/30 backdrop-blur-sm">Or email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-[2px] text-white/40 ml-4 mb-2 block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3.5 focus:outline-none focus:border-[#7B2FFF]/50 transition-colors"
              required
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold tracking-[2px] text-white/40 ml-4 mb-2 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3.5 focus:outline-none focus:border-[#7B2FFF]/50 transition-colors"
              required
            />
          </div>
          
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-sm mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <LoadingSpinner size="sm" /> : "Sign In →"}
          </button>
        </form>

        <p className="text-center mt-10 text-xs text-white/40">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#FF3CAC] font-bold hover:underline">
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
