"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: "#1A1A1A",
            color: "#FFF",
            border: "1px solid rgba(255,255,255,0.1)",
            fontFamily: "var(--font-space-grotesk)",
            borderRadius: "16px",
          },
        }}
      />
      {children}
    </SessionProvider>
  );
}
