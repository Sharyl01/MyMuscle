import { ProductScreen } from "./product-screen";
import s from "./marketing.module.css";

export function StrengthProgress() {
  return <section id="progress" className={`${s.strength} ${s.section} ${s.storySection}`} aria-labelledby="strength-title">
    <div className={s.sectionTop}><p className={s.eyebrow}>03 / IMPROVE</p><span className={s.sectionCategory}>STRENGTH PROGRESS</span></div>
    <div className={s.progressGrid}>
      <div className={s.sectionCopy}>
        <h2 id="strength-title">Stronger.<br />And you can<br />prove it.</h2>
        <p className={s.productStatement}>Know exactly how much stronger you’ve become.</p>
        <div className={s.progressMetric}><strong>+33.3<span>%</span></strong><p>Bench Press · 30 days</p><small>Example progression, shown in the app.</small></div>
      </div>
      <ProductScreen src="/marketing/strength-app.webp" label="Strength Progress" width={860} height={1680} alt="Actual MyMuscle Barbell Bench Press screen: rising 30-day graph, 11 sessions, 83 kg best and +33.3% improvement" />
    </div>
  </section>;
}
