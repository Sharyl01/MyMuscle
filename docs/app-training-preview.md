# Website training preview

The website uses byte-for-byte snapshots of the app's pure training modules in
`src/lib/app-training`. These cover exercise muscle weights, effective-set stimulus,
training-experience thresholds, the 12-step load spectrum and mesh aliases.
The website writes no workout or account data. It keeps example logs in React state.

Sync after changing the app engine:

```sh
node scripts/sync-app-training.mjs
node scripts/sync-app-training.mjs --check
```

The default source is the sibling `Fitnessapp28-11-2025` directory; override it with
`MYMUSCLE_APP_SOURCE`. The copies preserve the app's imports and bytes. A hash manifest
and parity tests detect drift. Do not edit the copied modules by hand.

`demo-data.ts` adapts website exercise labels to app IDs and passes real sets to
`sumStimulusForDate`. Weight is retained in the log; the app's stimulus equation
uses reps and effort, not lifted kilograms. Compound exercises credit every involved
muscle. Thresholds use the selected experience level, initially Intermediate.
Each 3D mesh uses its app muscle key, original spectrum color and opacity. The
editorial summary describes the highest-loaded part of the selected muscle group,
names that part, and does not sum left/right sides into a doubled load.

The recovery preview is a recording of the current app's week screen, captured with
isolated example data and blocked external network requests. It includes the actual
moon and star animation. `scripts/capture-recovery-preview.mjs` captures a poster and
source video from `MYMUSCLE_APP_URL` (default `http://localhost:8081`). The web asset is
a muted 5-second WebM at 430 × 1060 CSS pixels, with a lossless 3× WebP poster.
Playwright video dimensions must match the CSS viewport; DPR affects screenshots only.
PR and group screens are captured at 1290 × 3120 pixels using
`scripts/capture-app-screens.mjs`. Run the recovery script separately with `--comparison`
and `--analysis` to capture each detail screen in a fresh session. Still images use 3× pixel density;
the website serves responsive images with quality 95. Video loads on interaction,
pauses offscreen, plays inline on phones, and requires explicit playback when reduced
motion is enabled. The poster remains available if playback fails.
