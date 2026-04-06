import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AmbientBackground from "@/components/ui/AmbientBackground";
import GlassCard from "@/components/ui/GlassCard";

export default function NetworkPage() {
  return (
    <main className="relative min-h-screen pt-40 pb-24 px-6 flex flex-col">
      <AmbientBackground />
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center max-w-4xl mx-auto w-full">
        <GlassCard className="w-full text-center py-20 px-8">
          <h1 className="text-4xl md:text-6xl font-syne font-extrabold tracking-tighter mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Founder Network
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with 120+ early-stage founders and industry experts. The community portal is launching shortly.
          </p>
        </GlassCard>
      </div>

      <Footer />
    </main>
  );
}
