import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AmbientBackground from "@/components/ui/AmbientBackground";
import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="relative min-h-screen pt-40 pb-24 px-6 flex flex-col">
      <AmbientBackground />
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center max-w-4xl mx-auto w-full">
        <GlassCard className="w-full text-center py-20 px-8">
          <h1 className="text-4xl md:text-6xl font-syne font-extrabold tracking-tighter mb-6 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Need support or have a partnership inquiry? Our team is available round the clock to help founders scale.
          </p>
          <div className="flex justify-center">
            <Link href="mailto:support@vklaunchosai.com" className="btn-primary px-8 py-4">
              Email Support
            </Link>
          </div>
        </GlassCard>
      </div>
      <Footer />
    </main>
  );
}
