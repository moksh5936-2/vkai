import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AmbientBackground from "@/components/ui/AmbientBackground";
import GlassCard from "@/components/ui/GlassCard";

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen pt-40 pb-24 px-6 flex flex-col">
      <AmbientBackground />
      <Navbar />
      
      <div className="flex-grow flex flex-col max-w-4xl mx-auto w-full">
        <GlassCard className="w-full py-12 px-8">
          <h1 className="text-3xl md:text-5xl font-syne font-extrabold tracking-tighter mb-8">
            Privacy Policy
          </h1>
          <div className="prose prose-invert max-w-none text-white/70">
            <p>Last updated: April 2026</p>
            <p>
              Your privacy is fundamental to VKai LaunchOS. We employ enterprise-grade security and state-of-the-art encryption to protect your startup&apos;s intellectual property. 
            </p>
            <p>
              Detailed policy documentation is currently being reviewed by our legal counsel. Check back shortly.
            </p>
          </div>
        </GlassCard>
      </div>

      <Footer />
    </main>
  );
}
