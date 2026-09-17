import Image from "next/image";
import { RecordCollection } from "./record-collection";
import { ProductScreen } from "./product-screen";
import { LaunchCountdown } from "./launch-countdown";
import { WaitlistCta } from "./waitlist-cta";
import { BadgeGallery } from "./badge-gallery";
import { OverviewExperience } from "./overview-experience";
import s from "./marketing.module.css";

export function Overview() {
  return (
    <section
      id="overview"
      className={`${s.section} ${s.storySection} ${s.overview}`}
      aria-labelledby="overview-title"
    >
      <div className={s.sectionTop}>
        <p className={s.eyebrow}>02 / UNDERSTAND</p>
        <span className={s.sectionCategory}>YOUR OVERVIEW</span>
      </div>
      <OverviewExperience />
    </section>
  );
}

export function PersonalRecords() {
  return (
    <section
      id="records"
      className={`${s.section} ${s.storySection} ${s.records}`}
      aria-labelledby="records-title"
    >
      <div className={s.sectionTop}>
        <p className={s.eyebrow}>04 / REMEMBER</p>
        <span className={s.sectionCategory}>PERSONAL RECORDS</span>
      </div>
      <div className={s.recordsGrid}>
        <RecordCollection />
        <div className={s.sectionCopy}>
          <span className={s.recordMark} aria-hidden="true">
            ↗
          </span>
          <h2 id="records-title">
            Every PR.
            <br />
            Remembered.
          </h2>
          <p>
            That weight you couldn’t lift.
            <br />
            Until you could.
          </p>
          <span className={s.detailLine}>
            1 rep max <i /> Volume <i /> Your personal bests
          </span>
        </div>
      </div>
    </section>
  );
}

export function Achievements() {
  return (
    <section
      id="achievements"
      className={`${s.section} ${s.achievements}`}
      aria-labelledby="achievements-title"
    >
      <div className={s.sectionTop}>
        <p className={s.eyebrow}>05 / ACHIEVE</p>
        <span className={s.sectionCategory}>EARNED. NEVER GIVEN.</span>
      </div>
      <h2 id="achievements-title">
        Progress worth
        <br />
        <span>collecting.</span>
      </h2>
      <p>Put in the work. Make it part of your story.</p>
      <BadgeGallery />
      <div className={s.achievementLine}>
        <span>Consistency becomes achievement.</span>
        <span>Achievement becomes motivation.</span>
      </div>
    </section>
  );
}

export function Community() {
  return (
    <section
      id="community"
      className={`${s.section} ${s.storySection} ${s.community}`}
      aria-labelledby="community-title"
    >
      <div className={s.sectionTop}>
        <p className={s.eyebrow}>06 / CONNECT</p>
        <span className={s.sectionCategory}>MYMUSCLE GROUPS</span>
      </div>
      <div className={s.communityGrid}>
        <div className={s.sectionCopy}>
          <h2 id="community-title">
            Your progress.
            <br />
            Your people.
          </h2>
          <p>
            Show up for yourself.
            <br />
            Keep showing up, together.
          </p>
          <div className={s.communityDetails}>
            <span>Train together</span>
            <span>Compare your lifts</span>
            <span>Share the milestones</span>
          </div>
        </div>
        <ProductScreen src="/marketing/groups-app-hd.webp" label="Groups" width={1290} height={3120} alt="Actual MyMuscle Groups screen showing The Training Club, member profiles, personal records and training streaks" />
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section
      id="waitlist"
      className={`${s.section} ${s.finalCta}`}
      aria-labelledby="final-title"
    >
      <Image
        className={s.finalLogo}
        src="/marketing/logo.svg"
        width={85}
        height={94}
        alt=""
      />
      <p className={s.eyebrow}>THIS IS YOUR NEXT CHAPTER.</p>
      <h2 id="final-title">
        Train. Track.
        <br />
        <span>Become stronger.</span>
      </h2>
      <p className={s.demoSummary}><strong>A preview of what’s possible.</strong><span>This website is an interactive demo. Discover more tools, deeper insights and the full MyMuscle experience in the app.</span></p>
      <LaunchCountdown />
      <WaitlistCta />
      <p className={s.finalNote}>Be first to hear what’s next for MyMuscle.</p>
      <span className={s.finalWatermark} aria-hidden="true">
        MYMUSCLE
      </span>
    </section>
  );
}
