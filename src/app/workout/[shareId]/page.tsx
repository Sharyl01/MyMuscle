import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkoutPreview, muscleLabels, weekdays, SHARE_ORIGIN } from "@/lib/workout-preview";
import { appDownloadDestination } from "@/lib/app-destinations";
import s from "./preview.module.css";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ shareId: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareId } = await params;
  const program = await getWorkoutPreview(shareId);
  if (!program) return { title: "Workout unavailable", robots: { index: false, follow: false } };
  const description = `${program.split} · ${program.frequency} days/week. Preview this workout and unlock the full program in MyMuscle.`;
  const url = `${SHARE_ORIGIN}/workout/${shareId}`;
  return { title: program.name, description, robots: { index: false, follow: false }, alternates: { canonical: url },
    openGraph: { title: `${program.name} | MyMuscle`, description, url, type: "website", siteName: "MyMuscle", images: [{ url: `${SHARE_ORIGIN}/marketing/social-preview.png`, width: 1200, height: 630, alt: "MyMuscle — your training, your way" }] },
    twitter: { card: "summary_large_image", title: `${program.name} | MyMuscle`, description, images: [`${SHARE_ORIGIN}/marketing/social-preview.png`] } };
}
function Lock() { return <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 14v3" /></svg>; }
export default async function WorkoutPreviewPage({ params }: Props) {
  const { shareId } = await params, program = await getWorkoutPreview(shareId);
  if (!program) notFound();
  const waitingForRelease = appDownloadDestination("iPhone") === `${SHARE_ORIGIN}/#waitlist` && appDownloadDestination("Android") === `${SHARE_ORIGIN}/#waitlist`;
  return <main className={s.page}>
    <header className={s.header}><Link href="/" aria-label="MyMuscle home"><Image src="/marketing/logo.svg" width={32} height={36} alt="" /><span>MYMUSCLE</span></Link><span className={s.eyebrow}>WORKOUT PREVIEW</span></header>
    <section className={s.hero} aria-labelledby="program-name">
      <span className={s.eyebrow}>A look inside the plan</span>
      <h1 id="program-name">{program.name}</h1>
      <p>{program.split} <span aria-hidden="true">·</span> {program.frequency} days / week</p>
      {program.emphasis.length ? <div className={s.focus} aria-label="Muscle emphasis">{program.emphasis.map(m => <span key={m}>{muscleLabels[m]}</span>)}</div> : null}
      <div className={s.week} aria-label="Weekly schedule">{weekdays.map((day, index) => <div key={day}><span>{day.slice(0, 3)}</span>{program.restDays.includes(index)
        ? <span className={s.restMoon} role="img" aria-label={`${day}: Rest day`}><Image src="/icons/rest-moon.svg" width={18} height={18} alt="" /><b aria-hidden="true">Z</b></span>
        : <i className={s.training} />}</div>)}</div>
    </section>
    <section className={s.workouts} aria-labelledby="preview-heading">
      <div className={s.sectionTitle}><h2 id="preview-heading">Your preview</h2><span>Around ⅓ of the plan</span></div>
      {program.previewWorkouts.map(workout => <article className={s.workout} key={workout.day}>
        <div className={s.workoutHeader}><span className={s.eyebrow}>{weekdays[workout.day]}</span><h3>{workout.name}</h3></div>
        <ol className={s.exercises}>{workout.exercises.map((exercise, index) => <li key={index}><span className={s.number}>{String(index + 1).padStart(2, "0")}</span><div><h4>{exercise.name}</h4>
          {exercise.sets.length ? exercise.sets.map((set, setIndex) => <p key={setIndex}>Set {setIndex + 1} · {set.durationSeconds ? `${set.durationSeconds}s` : set.reps === set.repMax ? `${set.reps} reps` : `${set.reps}–${set.repMax} reps`} <span>· {set.restSeconds}s rest</span></p>) : <p>Set details available in MyMuscle</p>}
        </div></li>)}</ol>
        {program.lockedDays.includes(workout.day) ? <div className={s.partial}><Lock /><span>The rest of this session is in MyMuscle</span></div> : null}
      </article>)}
      {program.lockedDays.filter(day => !program.previewWorkouts.some(w => w.day === day)).map(day => <article className={s.locked} key={day}><Lock /><div><h3>{weekdays[day]}</h3><p>Full session available in MyMuscle</p></div><span className={s.lockBadge}>LOCKED</span></article>)}
    </section>
    <section className={s.unlock} aria-labelledby="unlock-heading"><span className={s.lockCircle}><Lock /></span><h2 id="unlock-heading">Unlock the Full Workout</h2><p>Download MyMuscle to view the complete program and save it to your own collection.</p>
      <a className={s.primary} href="/download">Download MyMuscle <span aria-hidden="true">↗</span></a>
      <a className={s.open} href={`musclefront://workout/${shareId}`}>Already have MyMuscle? Open the program <span aria-hidden="true">→</span></a>
      {waitingForRelease ? <p className={s.note}>Coming soon. Join the waitlist for launch updates.</p> : null}
      <p className={s.note}>After installing, return to this link to open your program. It will be kept while you sign in.</p>
    </section>
    <footer className={s.footer}><Link href="/">MyMuscle</Link><span>Your training. Your way.</span></footer>
  </main>;
}
