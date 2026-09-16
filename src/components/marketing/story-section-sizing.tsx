"use client";

import { useEffect } from "react";

/** Match chapter heights to their tallest content, including loaded fonts and images. */
export function StorySectionSizing() {
  useEffect(() => {
    const sections = ["overview", "progress", "records", "community"].map(id => document.getElementById(id)!);
    let frame = 0;
    const measure = () => {
      const heights = sections.map(section => {
        const [heading, content] = Array.from(section.children) as HTMLElement[];
        const sectionStyle = getComputedStyle(section);
        const headingStyle = getComputedStyle(heading);
        const contentStyle = getComputedStyle(content);
        const children = Array.from(content.children).map(child => child.getBoundingClientRect().height);
        const stacked = matchMedia("(max-width: 800px)").matches;
        return parseFloat(sectionStyle.paddingTop) + parseFloat(sectionStyle.paddingBottom)
          + heading.getBoundingClientRect().height + parseFloat(headingStyle.marginBottom)
          + (stacked ? children.reduce((total, height) => total + height, 0) + parseFloat(contentStyle.rowGap) : Math.max(...children));
      });
      const height = `${Math.ceil(Math.max(...heights))}px`;
      for (const section of sections) section.style.setProperty("--story-height", height);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    for (const section of sections) {
      observer.observe(section.firstElementChild!);
      for (const child of section.lastElementChild!.children) observer.observe(child);
    }
    window.addEventListener("resize", schedule);
    measure();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("resize", schedule); };
  }, []);
  return null;
}
