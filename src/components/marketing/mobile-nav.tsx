"use client";

import s from "./marketing.module.css";

export function MobileNav() {
  return (
    <details className={s.mobileNav}>
      <summary aria-label="Explore MyMuscle sections">
        Explore <span aria-hidden="true">+</span>
      </summary>
      <div>
        {[
          ["#experience", "Try MyMuscle"],
          ["#overview", "The experience"],
          ["#progress", "Your progress"],
          ["#community", "Together"],
        ].map(([href, label]) => (
          <a
            href={href}
            key={href}
            onClick={(event) =>
              event.currentTarget.closest("details")?.removeAttribute("open")
            }
          >
            {label}
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </details>
  );
}
