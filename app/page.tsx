"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TickerBar from "@/components/TickerBar";
import AmbientBackground from "@/components/ui/AmbientBackground";
import GlassCard from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import Link from "next/link";

interface Stats {
  founders: number;
  investors: number;
  consultants: number;
  totalMembers: number;
  chatMessages: number;
}

export default function Homepage() {
  const [stats, setStats] = useState<Stats>({
    founders: 0,
    investors: 0,
    consultants: 0,
    totalMembers: 0,
    chatMessages: 0,
  });

  useEffect(() => {
    fetch("/api/network/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  const features = [
    {
      title: "Idea Validation",
      desc: "Get objective 0-100 scores based on market data and current trends.",
      icon: "🎯",
      color: "border-purple-500",
    },
    {
      title: "Pitch Generator",
      desc: "Go from concept to a 10-slide VC-ready pitch deck in under 60 seconds.",
      icon: "⚡",
      color: "border-pink-500",
    },
    {
      title: "Lean Canvas",
      desc: "Automatic business model generation to map your value proposition.",
      icon: "🏗️",
      color: "border-cyan-500",
    },
    {
      title: "Financial Engine",
      desc: "3-year revenue and cost projections with simple natural language inputs.",
      icon: "📈",
      color: "border-purple-500",
    },
    {
      title: "Investor Match",
      desc: "AI identifies the best incubators and VCs for your specific stage and sector.",
      icon: "🤝",
      color: "border-pink-500",
    },
    {
      title: "Growth Strategy",
      desc: "Direct, analytical advice on hiring, marketing, and scaling your startup.",
      icon: "🚀",
      color: "border-cyan-500",
    },
  ];

  return (
    <main className="relative min-h-screen">
      <AmbientBackground />
      <TickerBar />
      <Navbar />

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
              Powered by Mistral AI
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-syne font-extrabold tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent leading-[1.1]"
          >
            The AI OS for <br />
            <span className="bg-gradient-to-r from-[#7B2FFF] to-[#FF3CAC] bg-clip-text text-transparent">
              Startup Founders.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Launch, validate, and scale your startup with a multimodal AI architecture 
            designed to think like a venture capitalist.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup" className="btn-primary w-full md:w-auto text-lg px-12 py-5">
              Get Started Free →
            </Link>
            <Link href="/ecosystem" className="btn-ghost w-full md:w-auto text-lg px-12 py-5">
              Explore Ecosystem
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center">
              <h3 className="text-3xl md:text-5xl font-syne font-extrabold text-[#7B2FFF] mb-2">
                {stats.founders || 120}+
              </h3>
              <p className="text-[10px] uppercase font-bold tracking-[2px] text-white/40">Founders</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl md:text-5xl font-syne font-extrabold text-[#FF3CAC] mb-2">
                {stats.investors || 45}+
              </h3>
              <p className="text-[10px] uppercase font-bold tracking-[2px] text-white/40">Investors</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl md:text-5xl font-syne font-extrabold text-[#00D4FF] mb-2">
                {stats.chatMessages || 1540}+
              </h3>
              <p className="text-[10px] uppercase font-bold tracking-[2px] text-white/40">AI Insights</p>
            </div>
            <div className="text-center">
              <h3 className="text-3xl md:text-5xl font-syne font-extrabold text-white mb-2">
                {stats.totalMembers || 214}+
              </h3>
              <p className="text-[10px] uppercase font-bold tracking-[2px] text-white/40">Total Members</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="section-label">Capabilities</span>
            <h2 className="section-title">Built for the Modern Founder.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <GlassCard key={i} delay={i * 0.1}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-6 bg-white/5 border-l-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h4 className="text-xl font-bold mb-4">{f.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-[40px] p-12 md:p-24 overflow-hidden text-center border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7B2FFF]/20 to-[#FF3CAC]/20 -z-10" />
            <div className="absolute inset-0 backdrop-blur-3xl -z-10" />
            
            <h2 className="text-3xl md:text-6xl font-syne font-extrabold mb-8 tracking-tighter">
              Ready to Launch Your <br /> Next Vision?
            </h2>
            <p className="text-white/60 mb-12 max-w-xl mx-auto text-lg leading-relaxed">
              Join a network of elite founders, investors, and expert AI agents. 
              Start building for free today.
            </p>
            <Link href="/signup" className="btn-primary inline-block text-xl px-16 py-6">
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
