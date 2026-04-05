"use client";

import { useEffect, useState } from "react";
import AmbientBackground from "@/components/ui/AmbientBackground";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  "IDEA_INPUT",
  "IDEA_VALIDATION",
  "RESEARCH_PATH_SELECTION",
  "RESEARCH_SUBMISSION",
  "AI_FEEDBACK_LOOP",
  "READINESS_SCORE",
  "EXECUTION_PATH",
  "MENTOR_MODE"
];

const STAGE_LABELS: Record<string, string> = {
  IDEA_INPUT: "Foundational Idea",
  IDEA_VALIDATION: "AI Impact Analysis",
  RESEARCH_PATH_SELECTION: "Focus Selection",
  RESEARCH_SUBMISSION: "Evidence Gathering",
  AI_FEEDBACK_LOOP: "Assumption Stress-Test",
  READINESS_SCORE: "Final Score",
  EXECUTION_PATH: "Execution Hub",
  MENTOR_MODE: "Mentor Mode"
};

import { StartupJourney, JourneyTask } from "@prisma/client";

export default function JourneyPageV2() {
  const [journey, setJourney] = useState<StartupJourney | null>(null);
  const [tasks, setTasks] = useState<JourneyTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [jRes, tRes] = await Promise.all([
          fetch("/api/journey/status"),
          fetch("/api/tasks")
        ]);
        const jData = await jRes.json();
        const tData = await tRes.json();
        setJourney(jData);
        setTasks(tData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleTask = async (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    await fetch(`/api/tasks/${taskId}/toggle`, { method: "POST" });
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  const currentIndex = STAGES.indexOf(journey?.stage || "IDEA_INPUT");

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <AmbientBackground />
      <Navbar />

      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <h1 className="text-6xl font-syne font-extrabold tracking-tighter mb-4">LaunchOS V2 ✦</h1>
          <p className="text-white/50 text-lg uppercase tracking-widest font-bold flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Live & Tracking
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-full px-8 py-4 backdrop-blur-xl">
          <p className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-1">Global Completion</p>
          <div className="flex items-center gap-4">
            <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#FF3CAC]" style={{ width: `${(currentIndex / 7) * 100}%` }} />
            </div>
            <span className="text-xl font-syne font-black">{Math.round((currentIndex / 7) * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <GlassCard className="!p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-widest text-[#FF3CAC] mb-2">Stage Readiness</p>
                <span className="text-6xl font-syne font-black">{journey?.readinessScore || 0}</span>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#7B2FFF] mb-4">Current Objective</h2>
              <h3 className="text-4xl font-syne font-extrabold mb-6 decoration-[#FF3CAC] underline-offset-8 underline">
                {journey?.stage ? STAGE_LABELS[journey.stage] : "Initializing..."}
              </h3>
              <p className="text-white/60 max-w-xl leading-relaxed text-lg">
                The VKai Decision Engine requires specific data markers to proceed. Complete the assigned tasks to unlock the next neural stage.
              </p>
            </div>

            <div className="space-y-4 max-w-2xl">
              <h4 className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-6">Assigned Workflow</h4>
              <AnimatePresence>
                {tasks.filter(t => t.stage === journey?.stage).map((task, idx) => (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => toggleTask(task.id)}
                    className={`group cursor-pointer p-6 rounded-3xl border transition-all flex items-center justify-between ${
                      task.completed ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20 group-hover:border-white/40"
                      }`}>
                        {task.completed && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div>
                        <p className={`font-bold transition-all ${task.completed ? "text-white/40 line-through" : "text-white"}`}>{task.title}</p>
                        <p className="text-xs text-white/30 mt-1">{task.description}</p>
                      </div>
                    </div>
                    <div className="text-[10px] uppercase font-black tracking-widest px-3 py-1 bg-white/5 rounded-full text-white/40">
                      P{task.priority}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="bg-white/5 !p-8">
              <p className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-4">Neural Confidence</p>
              <div className="text-3xl font-syne font-black text-emerald-400">84%</div>
            </GlassCard>
            <GlassCard className="bg-white/5 !p-8">
              <p className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-4">Feedback Loops</p>
              <div className="text-3xl font-syne font-black">{journey?.feedbackLoopCount || 0}/3</div>
            </GlassCard>
            <GlassCard className="bg-[#7B2FFF]/10 border-[#7B2FFF]/20 !p-8">
              <p className="text-[10px] uppercase font-black tracking-widest text-[#7B2FFF] mb-4">V2 OS Status</p>
              <div className="text-3xl font-syne font-black">ACTIVE</div>
            </GlassCard>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="bg-white/5">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Roadmap Visualization</h4>
            <div className="space-y-6 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-white/5" />
              {STAGES.map((s, i) => (
                <div key={s} className={`flex items-center gap-4 transition-all ${i > currentIndex ? 'opacity-20' : 'opacity-100'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 z-10 transition-all ${
                    i < currentIndex ? 'bg-emerald-500 border-emerald-500' :
                    i === currentIndex ? 'bg-[#FF3CAC] border-[#FF3CAC] shadow-[0_0_15px_rgba(255,60,172,0.5)]' :
                    'bg-zinc-900 border-white/20'
                  }`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${i === currentIndex ? 'text-white' : 'text-white/40'}`}>
                    {STAGE_LABELS[s]}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="bg-gradient-to-br from-[#FF3CAC]/10 to-transparent border-[#FF3CAC]/20">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-[#FF3CAC]">AI Next Action</h4>
            <p className="text-sm font-medium leading-relaxed text-white/70 italic">
              &quot;Based on loop 1 analysis, your unit economics are slightly optimistic. Focus on the &apos;Map Revenue Model&apos; task to stabilize your viability score.&quot;
            </p>
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/10 border border-zinc-900" />)}
              </div>
              <span className="text-[9px] uppercase font-black text-white/30 tracking-widest">3 Investors Tracking</span>
            </div>
          </GlassCard>

          <a href="/dashboard/chat" className="block p-6 rounded-3xl bg-white text-black font-black uppercase tracking-[0.2em] text-center text-xs hover:scale-[1.02] transition-all">
            Open Control Center
          </a>
        </div>
      </div>
    </main>
  );
}
