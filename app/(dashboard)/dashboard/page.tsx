import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import GlassCard from "@/components/ui/GlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      credits: true,
      subscription: true,
      _count: {
        select: { chatSessions: true, savedResults: true },
      },
    },
  });

  if (!user) redirect("/login");

  const role = user.role;

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <AmbientBackground />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-syne font-extrabold mb-2 tracking-tighter">
            Hello, {user.name?.split(" ")[0]} ✦
          </h1>
          <p className="text-white/40 font-medium">
            Welcome to your {role.toLowerCase()} command center.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <GlassCard className="!p-4 bg-[#7B2FFF]/10 border-[#7B2FFF]/20">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#7B2FFF] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#7B2FFF]">
                {(user.credits?.chatCredits || 0) - (user.credits?.chatCreditsUsed || 0)} Credits Left
              </span>
            </div>
          </GlassCard>
          <Link href="/dashboard/chat" className="btn-primary py-3.5 px-8 text-sm">
            New Chat +
          </Link>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Role Specific Metrics */}
        {role === "FOUNDER" && (
          <>
            <GlassCard className="md:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-syne text-xl font-bold">Startup Readiness</h3>
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Global Rank: #42</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <MetricRing label="Viability" value={78} color="#7B2FFF" />
                <MetricRing label="Market" value={62} color="#FF3CAC" />
                <MetricRing label="Product" value={91} color="#00D4FF" />
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="font-syne text-xl font-bold mb-6">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                <ActionLink title="Validate New Idea" icon="🎯" href="/dashboard/chat" />
                <ActionLink title="Pitch Deck Generator" icon="⚡" href="/dashboard/chat" />
                <ActionLink title="Financial Strategy" icon="📈" href="/dashboard/chat" />
                <ActionLink title="Find Investors" icon="🤝" href="/dashboard/ecosystem" />
              </div>
            </GlassCard>
          </>
        )}

        {role === "INVESTOR" && (
          <>
            <GlassCard className="md:col-span-2">
              <h3 className="font-syne text-xl font-bold mb-8">Portfolio Discovery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Total Startups</p>
                  <p className="text-3xl font-syne font-extrabold">214</p>
                </div>
                <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">New Leads (24h)</p>
                  <p className="text-3xl font-syne font-extrabold text-[#FF3CAC]">12</p>
                </div>
              </div>
              <Link href="/dashboard/ecosystem" className="btn-ghost w-full mt-6 text-sm text-center">
                Browse Deal Flow →
              </Link>
            </GlassCard>
            
            <GlassCard>
              <h3 className="font-syne text-xl font-bold mb-6">Market Sentiment</h3>
              <div className="h-40 flex items-center justify-center text-white/20 border-2 border-dashed border-white/10 rounded-2xl">
                Sentiment Chart Placeholder
              </div>
            </GlassCard>
          </>
        )}

        {/* Global Widgets */}
        <GlassCard>
          <h3 className="font-syne text-xl font-bold mb-6">Recent Activity</h3>
          <div className="flex flex-col gap-4">
            <ActivityItem 
              title="Chat: AI Strategy Session" 
              time="2 hours ago" 
              icon="💬" 
            />
            <ActivityItem 
              title="Saved: Lean Canvas v2" 
              time="Yesterday" 
              icon="💾" 
            />
            <ActivityItem 
              title="Welcome Bonus Credits" 
              time="2 days ago" 
              icon="🎁" 
            />
          </div>
        </GlassCard>

        <GlassCard className="md:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <p className="text-center mt-10 text-xs text-white/40">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#FF3CAC] font-bold hover:underline">
                Sign up for free
              </Link>
            </p>
            <Link href="/dashboard/chat" className="text-xs font-bold text-[#FF3CAC] hover:underline">Launch Plan →</Link>
          </div>
          <div className="space-y-6">
            <MilestoneItem title="Finalize MVP Scope" status="In Progress" progress={65} />
            <MilestoneItem title="Investor Pitch Deck" status="Planned" progress={0} />
            <MilestoneItem title="Legal Incorporation" status="Done" progress={100} />
          </div>
        </GlassCard>

      </div>
    </main>
  );
}

function MetricRing({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/5" />
          <circle 
            cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="6" 
            strokeDasharray={226} strokeDashoffset={226 - (226 * value) / 100}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-lg font-syne font-extrabold">{value}%</span>
      </div>
      <span className="text-[10px] uppercase font-bold tracking-[2px] text-white/40">{label}</span>
    </div>
  );
}

function ActionLink({ title, icon, href }: { title: string; icon: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <span className="text-white/20 group-hover:text-white transition-colors">→</span>
    </Link>
  );
}

function ActivityItem({ title, time, icon }: { title: string; time: string; icon: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-[10px] text-white/30 uppercase font-bold">{time}</p>
      </div>
    </div>
  );
}

function MilestoneItem({ title, status, progress }: { title: string; status: string; progress: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{title}</span>
        <span className={`text-[10px] font-bold uppercase tracking-widest ${progress === 100 ? 'text-emerald-500' : 'text-white/40'}`}>
          {status}
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#7B2FFF] to-[#FF3CAC] rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
