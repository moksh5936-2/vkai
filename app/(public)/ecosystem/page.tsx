import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AmbientBackground from "@/components/ui/AmbientBackground";
import GlassCard from "@/components/ui/GlassCard";

export default function EcosystemPage() {
  return (
    <main className="relative min-h-screen pt-40 pb-24 px-6 flex flex-col">
      <AmbientBackground />
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center max-w-4xl mx-auto w-full">
        <GlassCard className="w-full text-center py-20 px-8">
          <h1 className="text-4xl md:text-6xl font-syne font-extrabold tracking-tighter mb-6 bg-gradient-to-r from-[#7B2FFF] to-[#FF3CAC] bg-clip-text text-transparent">
            Ecosystem
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            The global network of founders, investors, and expert services is currently being upgraded. 
            Check back soon for the most integrated startup ecosystem experience.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-widest text-white/70">
              Coming Soon
            </span>
          </div>
        </GlassCard>
      </div>

      <Footer />
    </main>
  );
}
