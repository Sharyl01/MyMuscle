"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import s from "./marketing.module.css";

const features = [
  { title: "See what you trained.", text: "Each day gets its own muscle map. Spot the muscles you worked and how much load they took on.", color: "#d6c59d" },
  { title: "Make recovery visible.", text: "Purple rest days, a floating moon and quiet stars. Recovery belongs in your week, too.", color: "#c6b8eb" },
  { title: "Compare your training days.", text: "Put one workout next to another. Compare your sets, volume and intensity, and see where you are making progress.", color: "#8fcba6" },
  { title: "Get your day analysis.", text: "Turn a completed workout into a clear recap: muscles trained, total volume, new PRs and recovery insights. Know what to take into your next session.", color: "#7eb9ed" },
] as const;

export function OverviewExperience() {
  const [feature, setFeature] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [failed, setFailed] = useState(false);
  const screen = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const requested = (hovered || pinned) && visible && feature < 2;
  const previewSrc = feature === 2 ? "/marketing/day-comparison-hd.webp" : feature === 3 ? "/marketing/day-analysis-hd.webp" : "/marketing/overview-current-hd.webp";
  const previewAlt = feature === 2 ? "Actual MyMuscle workout comparison showing sets, volume and intensity for two training days" : feature === 3 ? "Actual MyMuscle day analysis showing workout volume, trained muscles, PRs and recovery insights" : "Current MyMuscle weekly overview with muscle load maps, purple rest days and moon recovery symbols";
  const stillImage = <Image src={previewSrc} width={1290} height={3180} quality={95} sizes="(max-width: 800px) 88vw, 480px" alt={previewAlt} />;

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(motion.matches);
    motion.addEventListener("change", update);
    update();
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(screen.current!);
    const hide = () => { if (document.hidden) { setPinned(false); setHovered(false); } };
    document.addEventListener("visibilitychange", hide);
    return () => { observer.disconnect(); motion.removeEventListener("change", update); document.removeEventListener("visibilitychange", hide); };
  }, []);

  useEffect(() => {
    const player = video.current;
    if (!player || !loaded) return;
    // Reduced-motion users can still explicitly choose to play via the button.
    if (requested && (!reduced || pinned)) {
      void player.play().catch(error => { if (error.name !== "AbortError") setFailed(true); });
    } else player.pause();
  }, [requested, loaded, reduced, pinned]);

  function chooseFeature(index: number) {
    setFeature(index);
    if (feature >= 2 || index >= 2) setPlaying(false);
    setHovered(false);
    setPinned(index === 1);
    if (index === 1) setLoaded(true);
    if (matchMedia("(max-width: 800px)").matches) screen.current?.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "center" });
  }

  return <div className={s.overviewGrid}>
    <div className={s.sectionCopy}>
      <h2 id="overview-title">Your week.<br />Training and recovery.</h2>
      <p>See the work. See the rest.<br />Understand how it all adds up.</p>
      <div className={s.overviewFeatures} aria-label="Explore the weekly overview">
        {features.map((item, index) => <button key={item.title} type="button" aria-pressed={feature === index}
          onClick={() => chooseFeature(index)}
          onPointerEnter={event => { if (event.pointerType === "mouse" && index === 1) { setLoaded(true); setHovered(true); } }}
          onPointerLeave={() => setHovered(false)}>
          <span className={s.featureNumber} style={{ color: item.color }}>0{index + 1}</span>
          <span><strong>{item.title}</strong><span>{item.text}</span></span>
          <span className={s.featureArrow} aria-hidden="true">↗</span>
        </button>)}
      </div>
    </div>
    <figure ref={screen} className={`${s.productScreen} ${s.recoveryScreen}`}>
      <div className={s.productBar}><span>INSIDE MYMUSCLE</span><span>{feature === 2 ? "COMPARE DAYS" : feature === 3 ? "DAY ANALYSIS" : "TRAIN + RECOVER"}</span></div>
      {feature >= 2 ? <a className={s.recoveryPlayer} href={previewSrc} target="_blank" rel="noopener noreferrer" aria-label={`View full ${feature === 2 ? "day comparison" : "day analysis"} screenshot (opens in a new tab)`}>{stillImage}</a> : <button type="button" className={s.recoveryPlayer} aria-label={pinned ? "Pause recovery animation" : "Play recovery animation"} aria-pressed={pinned}
        onPointerEnter={event => { if (event.pointerType === "mouse") { setHovered(true); setLoaded(true); } }}
        onPointerLeave={() => setHovered(false)}
        onClick={() => { setLoaded(true); setHovered(false); setPinned(!pinned); setFeature(1); }}>
        {stillImage}
        <video ref={video} src={loaded ? "/marketing/overview-recovery-v2.webm" : undefined} muted playsInline loop preload="none"
          aria-hidden="true" tabIndex={-1} data-playing={playing && !failed}
          onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)} />
        {!playing && feature === 0 && <span className={s.overviewHighlight} aria-hidden="true" />}
        <span className={s.recoveryPlayHint} aria-hidden="true"><span>{playing ? "Ⅱ" : "▷"}</span>{playing ? "Recovery in motion" : "See recovery in motion"}</span>
      </button>}
      <figcaption><span>Actual app · {feature >= 2 ? "Example workouts" : "Example week"}</span><a href={previewSrc} target="_blank" rel="noopener noreferrer">View full screen ↗<span className={s.srOnly}> (opens in a new tab)</span></a></figcaption>
      <p className={s.recoveryInstruction}>{feature >= 2 ? "Tap the screen to explore the full detail." : failed ? "Animation unavailable. Open the full screen to explore the overview." : "Hover to preview. Tap to play or pause."}</p>
    </figure>
  </div>;
}
