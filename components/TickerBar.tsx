"use client";

import { motion } from "framer-motion";

export default function TickerBar() {
  const items = [
    "IDEA VALIDATION",
    "✦",
    "PITCH DECK GENERATOR",
    "✦",
    "BUSINESS MODEL CANVAS",
    "✦",
    "FINANCIAL PROJECTIONS",
    "✦",
    "INVESTOR MATCHING",
    "✦",
    "STARTUP ECOSYSTEM",
    "✦",
  ];

  // Repeat items to fill space for infinite marquee
  const repeatedItems = [...items, ...items, ...items, ...items];

  return (
    <div className="w-full bg-[#7B2FFF] py-2 overflow-hidden whitespace-nowrap border-y border-white/10 relative z-50">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="inline-flex items-center"
      >
        {repeatedItems.map((item, idx) => (
          <span
            key={idx}
            className={`text-[10px] font-bold uppercase tracking-[2px] mx-6 ${
              item === "✦" ? "text-[#FF3CAC]" : "text-white"
            }`}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
