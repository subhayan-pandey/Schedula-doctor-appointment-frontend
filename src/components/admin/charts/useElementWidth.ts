"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks an element's rendered width so SVG charts can draw at real pixel
 * size (crisp text, correct on mobile) instead of scaling a fixed viewBox.
 */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const next = Math.floor(entries[0]?.contentRect.width ?? 0);

      setWidth((current) => (current === next ? current : next));
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}
