import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AmbientBackground from "@/components/ui/AmbientBackground";
import GlassCard from "@/components/ui/GlassCard";

export default function TermsPage() {
  return (
    <main className="relative min-h-screen pt-40 pb-24 px-6 flex flex-col">
      <AmbientBackground />
      <Navbar />
      
      <div className="flex-grow flex flex-col max-w-4xl mx-auto w-full">
        <GlassCard className="w-full py-12 px-8">
          <h1 className="text-3xl md:text-5xl font-syne font-extrabold tracking-tighter mb-8">
            Terms of Service
          </h1>
          <div className="prose prose-invert max-w-none text-white/70">
            <p>Last updated: April 2026</p>
            <p>
              By utilizing the VKai LaunchOS AI platform, you agree to our terms of engagement. Our system provides AI-powered startup advice and modeling, but is not a substitute for formal financial or legal counsel.
            </p>
            <p>
              Full terms are pending legal review. Check back soon.
            </p>
          </div>
        </GlassCard>
      </div>

      <Footer />
    </main>
  );
}
