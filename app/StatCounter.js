"use client";

import { useEffect, useRef, useState } from "react";

// Counts up from 0 to `value` once the stat scrolls into view. `value`
// itself always comes from the caller (real data or a documented fact
// about the codebase) — this component only animates the reveal, it
// never invents the number.
export default function StatCounter({ value, prefix = "", suffix = "", duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        const start = performance.now();
        function tick(now) {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <b ref={ref}>
      {prefix}
      {display.toLocaleString("en-US")}
      {suffix}
    </b>
  );
}
