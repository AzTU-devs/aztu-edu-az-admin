import { useEffect, useRef, useState } from "react";

const DURATION = 1200;

/**
 * Counts from 0 up to `target`, restarting whenever the target changes.
 *
 * The dashboard figures arrive after the first paint, so the old setInterval
 * version — which ran once on mount against a hardcoded constant — animated to
 * the wrong number and never re-ran. This keys off the value instead, and
 * returns null while the value is still unknown so callers can render a dash
 * rather than a confident zero.
 */
export default function useCountUp(target: number | null | undefined): number | null {
  const [value, setValue] = useState<number | null>(
    typeof target === "number" ? 0 : null
  );
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (typeof target !== "number" || !Number.isFinite(target)) {
      setValue(null);
      return;
    }

    // Nothing to animate towards — skip the rAF loop entirely.
    if (target === 0) {
      setValue(0);
      return;
    }

    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1);
      // easeOutCubic: fast to begin with, settles onto the exact figure.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    };

    frame.current = requestAnimationFrame(tick);

    return () => {
      if (frame.current !== undefined) {
        cancelAnimationFrame(frame.current);
      }
    };
  }, [target]);

  return value;
}
