import Image from "next/image";
import Link from "next/link";
import { LaunchCountdown } from "./launch-countdown";
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
      <div className={h.storeBadges}>
        <a href="#waitlist" className={h.storeBadge} aria-label="MyMuscle on the App Store — coming soon. Get launch updates">
          <svg viewBox="0 0 24 24" aria-hidden="true" className={h.appleLogo}><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.76 3.08.82 1.18-.24 2.31-.94 3.57-.85 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.08l.01-.01ZM12.03 7.25C11.88 5.02 13.69 3.18 15.77 3c.29 2.58-2.34 4.5-3.74 4.25Z" /></svg>
          <span><small>Coming soon on the</small><strong>App Store</strong></span>
        </a>
        <a href="#waitlist" className={h.storeBadge} aria-label="MyMuscle on Google Play — coming soon. Get launch updates">
          <svg viewBox="0 0 32 36" aria-hidden="true" className={h.playLogo}>
            <path fill="#34a853" d="M2 1.1C1.3.7.6 1 .3 1.7L17 18 24.6 10.3 2 1.1Z" />
            <path fill="#4285f4" d="M.3 1.7C.1 2 0 2.5 0 3v30c0 .5.1 1 .3 1.3L17 18 .3 1.7Z" />
            <path fill="#fbbc04" d="m17 18 7.6-7.7 6 5.9c1.2.8 1.2 2.8 0 3.6l-6 5.9L17 18Z" />
            <path fill="#ea4335" d="M.3 34.3c.3.7 1 1 1.7.6l22.6-9.2L17 18 .3 34.3Z" />
          </svg>
          <span><small>Coming soon on</small><strong>Google Play</strong></span>
        </a>
      </div>
    </div>
  </header>;
}
