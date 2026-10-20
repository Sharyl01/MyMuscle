import Link from "next/link";
export default function WorkoutNotFound() {
  return <main className="min-h-screen bg-black px-6 py-24 text-white"><div className="mx-auto max-w-lg space-y-6"><p className="text-xs tracking-widest">MYMUSCLE</p><h1 className="text-3xl font-bold">This workout link is unavailable</h1><p className="leading-7 text-neutral-400">The link may have been deactivated by its owner. Ask them for a new link.</p><Link className="inline-block rounded-xl bg-white px-6 py-4 text-black" href="/">Visit MyMuscle</Link></div></main>;
}
