import Image from "next/image";
import Link from "next/link";
import { LaunchCountdown } from "./launch-countdown";
import { StoreBadges } from "./store-badges";
import h from "./hero.module.css";

export function AppIntroduction() {
  return <header className={h.appIntroduction} aria-label="MyMuscle mobile app">
    <LaunchCountdown variant="compact" />
    <div className={h.appIdentity}>
      <div>
        <p className={h.appCategory}>THE MUSCLE-TRACKING APP</p>
        <Link href="/" className={h.appBrand} aria-label="MyMuscle home"><Image src="/marketing/logo.svg" width={40} height={46} alt="" priority /><span className={h.appName} aria-hidden="true">MyMuscle<span>.</span></span></Link>
        <p className={h.appDescription}>Training. Recovery. Progress. In your pocket.</p>
      </div>
    </div>
    <div className={h.storeAvailability}>
      <StoreBadges />
    </div>
  </header>;
}
