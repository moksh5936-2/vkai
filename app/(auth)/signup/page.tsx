"use client";

import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AmbientBackground from "@/components/ui/AmbientBackground";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const ROLES = [
  { id: "FOUNDER", label: "Founder", icon: "🚀", color: "border-purple-500" },
  { id: "INVESTOR", label: "Investor", icon: "💰", color: "border-pink-500" },
  { id: "CONSULTANT", label: "Consultant", icon: "👔", color: "border-cyan-500" },
  { id: "INCUBATOR", label: "Incubator", icon: "🐣", color: "border-emerald-500" },
  { id: "BANK", label: "Bank", icon: "🏦", color: "border-orange-500" },
];

export default function SignupPage() {
  const { signUpWithEmail, signInWithGoogle, loading, error } = useFirebaseAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("FOUNDER");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signUpWithEmail(email, password, role);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative">
      <AmbientBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full p-12 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-3xl shadow-2xl"
      >
        <div className="text-center mb-10">
          <Link href="/" className="font-syne text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-[#7B2FFF] to-[#FF3CAC] bg-clip-text text-transparent inline-block mb-8">
            VK-AI
          </Link>
          <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
          <p className="text-white/40 text-sm">Step {step} of 2</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-8"
            >
              <div>
                <label className="text-[10px] uppercase font-bold tracking-[2px] text-white/40 mb-6 block text-center">
                  Select Your Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${
                        role === r.id 
                          ? `${r.color} bg-white/5` 
                          : "border-white/5 bg-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <span className="text-2xl">{r.icon}</span>
                      <span className="text-xs font-bold uppercase tracking-wider">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="btn-primary w-full py-4 text-sm mt-4 font-bold"
              >
                Continue →
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => signInWithGoogle(role)}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-white text-black font-bold text-sm"
                >
                  Sign up with Google
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black/20 px-4 text-white/30 backdrop-blur-sm">Or email</span>
                </div>
              </div>

              <form onSubmit={handleSignup} className="flex flex-col gap-4">
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3.5 focus:outline-none focus:border-[#7B2FFF]/50"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3.5 focus:outline-none focus:border-[#7B2FFF]/50"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Referral Code (Optional)"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3.5 focus:outline-none focus:border-[#7B2FFF]/50 text-xs"
                  />
                </div>

                {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                <div className="flex items-center gap-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-white/30 hover:text-white transition-colors px-4"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 py-4 text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : "Complete Signup →"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center mt-10 text-xs text-white/40">
          Already have an account?{" "}
          <Link href="/login" className="text-[#FF3CAC] font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
