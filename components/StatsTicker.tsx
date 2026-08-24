"use client";

import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/format";

export function StatsTicker({
  startingVisitors,
  online,
}: {
  startingVisitors: number;
  online: number;
}) {
  const [visitors, setVisitors] = useState(startingVisitors);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisitors((v) => v + Math.floor(Math.random() * 3));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted">
      <span className="inline-flex items-center gap-1.5">
        <span
          className="live-dot h-1.5 w-1.5 rounded-full bg-accent"
          aria-hidden="true"
        />
        {formatNumber(online)} online
      </span>
      <span aria-hidden="true">&middot;</span>
      <span className="font-mono">{formatNumber(visitors)}</span> visitors
      since launch
    </p>
  );
}
