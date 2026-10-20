"use client";
export default function WorkoutPreviewError({ reset }: { reset: () => void }) {
  return <main className="min-h-screen bg-black px-6 py-24 text-white"><div className="mx-auto max-w-lg space-y-6"><h1 className="text-3xl font-bold">Your preview could not be loaded</h1><p className="text-neutral-400">Please try again in a moment.</p><button onClick={reset} className="rounded-xl bg-white px-6 py-4 text-black">Try again</button></div></main>;
}
