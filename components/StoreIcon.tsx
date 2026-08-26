"use client";

import { useState } from "react";

export function StoreIcon({
  domain,
  name,
  className,
}: {
  domain: string;
  name: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className={`${className} bg-accent-tint`} />;
  }

  return (
    // External, dynamically-sized favicons per domain — not worth
    // next/image's remote-pattern config for a small icon like this.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`}
      alt={`${name} logo`}
      className={`${className} bg-accent-tint object-cover`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
