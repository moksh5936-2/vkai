"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Footer() {
  const [healthStatus, setHealthStatus] = useState("Operational");

  // Fetch health status on mount
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHealthStatus(data.status || "Operational"))
      .catch(() => setHealthStatus("Operational"));
  }, []);

  const footerLinks = {
    Company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Support", href: "/contact" },
    ],
    Platform: [
      { name: "Ecosystem", href: "/ecosystem" },
      { name: "Network", href: "/network" },
      { name: "Pricing", href: "/pricing" },
      { name: "Resources", href: "/resources" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/privacy" },
    ],
  };

  return (
    <footer className="w-full bg-[#0A0A0A] border-t border-white/5 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="font-syne text-2xl font-extrabold tracking-tighter text-white">
              VK-AI
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-[200px]">
              The Startup Operating System powered by Mistral AI.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex flex-col gap-6">
              <h4 className="text-xs font-bold uppercase tracking-[2px] text-[#FF3CAC]">
                {title}
              </h4>
              <ul className="flex flex-col gap-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-white/30 uppercase tracking-[1px]">
            &copy; {new Date().getFullYear()} VKai LaunchOS AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-[2px]">
              System Health:
            </span>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[1px]">
                ✦ {healthStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
