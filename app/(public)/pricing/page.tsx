import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AmbientBackground from "@/components/ui/AmbientBackground";
import GlassCard from "@/components/ui/GlassCard";

export default function PricingPage() {
  return (
    <main className="relative min-h-screen pt-40 pb-24 px-6 flex flex-col">
      <AmbientBackground />
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center max-w-4xl mx-auto w-full">
        <GlassCard className="w-full text-center py-20 px-8">
          <h1 className="text-4xl md:text-6xl font-syne font-extrabold tracking-tighter mb-6 bg-gradient-to-r from-[#7B2FFF] to-[#FF3CAC] bg-clip-text text-transparent">
            Transparent Pricing
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            We are finalizing our subscription tiers to offer maximum value to early-stage founders. 
            All core features currently have generous free allocations.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#FF3CAC] animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-widest text-white/70">
              Plans Outlining Soon
            </span>
          </div>
        </GlassCard>
      </div>

      <Footer />
    </main>
  );
}
