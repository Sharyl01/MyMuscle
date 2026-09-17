"use client";

import Image from "next/image";
import { useState } from "react";
import s from "./marketing.module.css";

// Matches the app's lib/badges/exerciseBadgeMetrics.ts thresholds and rank order.
const badges = [
  { image: "pullup-bronze.webp", title: "Pull-up", tier: "Bronze", className: s.bronzeBadge,
    male: "5 reps", female: "1 rep", condition: "Strict pull-ups in a single set. No kipping.",
    note: "Log your set in MyMuscle to earn this badge." },
  { image: "bench-gold.webp", title: "Bench Press", tier: "Gold", className: s.goldBadge,
    male: "80 kg", female: "40 kg", condition: "Reach the Gold bench press strength milestone.",
    note: "Based on your bench press record in MyMuscle's 1 rep max category." },
  { image: "ratio-squat-platinum.png", title: "Ratio Squat", tier: "Platinum", className: s.platinumBadge,
    male: "1.6 × BW", female: "1.6 × BW", condition: "Reach a back squat 1 rep max of 1.6 times your bodyweight.",
    note: "Based on your back squat 1 rep max divided by your bodyweight." },
] as const;

export function BadgeGallery() {
  const [selected, setSelected] = useState<number | null>(null);
  const badge = selected === null ? null : badges[selected];

  return <>
    <div className={s.badgeGallery}>
      {badges.map((item, index) => <figure key={item.image} className={item.className}>
        <button type="button" className={s.badgeButton}
          aria-label={`${item.tier} ${item.title} badge requirements`}
          aria-expanded={selected === index} aria-controls="badge-requirements"
          onClick={() => setSelected(selected === index ? null : index)}>
          <Image src={`/marketing/${item.image}`} alt="" width={500} height={500} sizes="(max-width: 700px) 30vw, 350px" />
          <span className={s.badgeAction}>{selected === index ? "Close details −" : "How to earn +"}</span>
        </button>
        <figcaption><span>{item.tier}</span><strong>{item.title}</strong></figcaption>
      </figure>)}
    </div>
    <div id="badge-requirements" aria-live="polite" aria-atomic="true">
      {badge && <section className={s.badgeRequirement} aria-label={`${badge.tier} ${badge.title} requirements`}>
        <div><p className={s.eyebrow}>HOW TO EARN IT</p><h3>{badge.tier} {badge.title}</h3><p>{badge.condition}</p></div>
        <dl><div><dt>Male profile</dt><dd>{badge.male}</dd></div><div><dt>Female profile</dt><dd>{badge.female}</dd></div></dl>
        <p className={s.badgeRequirementNote}>{badge.note}</p>
      </section>}
    </div>
  </>;
}
