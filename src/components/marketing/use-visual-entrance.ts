"use client";

import { useEffect, useRef } from "react";

/** Reveal once on arrival, without a scroll listener or continuous animation. */
export function useVisualEntrance() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reveal = () => { element.dataset.revealed = "true"; };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { reveal(); observer.disconnect(); }
    }, { threshold: 0.2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return ref;
}
