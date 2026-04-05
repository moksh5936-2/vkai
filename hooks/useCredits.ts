"use client";

import { useState, useEffect } from "react";

export function useCredits() {
  const [credits, setCredits] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const res = await fetch("/api/credits/check");
      const data = await res.json();
      setCredits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { credits, loading, fetchCredits };
}
