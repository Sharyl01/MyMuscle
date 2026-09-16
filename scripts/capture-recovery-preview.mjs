import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

// Capture the running app with browser-local example data. No account/network writes.
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
const context = await browser.newContext({
  viewport: { width: 430, height: 1060 }, deviceScaleFactor: 3,
  recordVideo: { dir: "artifacts/recovery/raw", size: { width: 430, height: 1060 } },
});
await mkdir("artifacts/recovery", { recursive: true });
const page = await context.newPage();
await page.route("**/*", route => {
  const url = new URL(route.request().url());
  return ["localhost", "127.0.0.1"].includes(url.hostname) ? route.continue() : route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
});
try {
  await page.goto(process.env.MYMUSCLE_APP_URL || "http://localhost:8081", { timeout: 60000 });
  await page.waitForFunction(() => globalThis.__r?.getModules && document.body.innerText.includes("Inloggen"), { timeout: 60000 });
  await page.evaluate(() => {
    const modules = Array.from(globalThis.__r.getModules().values()).map(module => module.publicModule.exports);
    const get = key => modules.find(module => module?.[key])?.[key];
    const profileStore = get("useProfileStore"), authStore = get("useAuthStore"), trainingStore = get("useTrainingStore");
    const userId = "00000000-0000-4000-8000-000000000001";
    const now = Date.now(), monday = new Date();
    monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7 - 7);
    monday.setHours(12, 0, 0, 0);
    const day = offset => { const d = new Date(monday); d.setDate(d.getDate() + offset); return d; };
    const key = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    const db = get("EXERCISE_DB");
    globalThis.captureDayLabel = day(1).toLocaleDateString("nl-NL", { day: "2-digit", month: "short" });
    const logs = [[1,"bench-press",4],[1,"triceps-pushdown",3],[2,"squat",5],[2,"seated-leg-curl-machine",4],[3,"pull-up",4],[3,"bb-curl",3],[5,"bench-press",3],[5,"lateral-raise",3]].map(([offset,id,count],i) => {
      const exercise = db.find(e => e.id === id);
      if (!exercise) throw new Error(`Missing fixture exercise: ${id}`);
      return {id:`preview-${i}`,ts:day(offset).getTime(),exerciseId:id,exercise:exercise.name,weights:exercise.weights,sets:Array.from({length:count},()=>({weight:60,reps:8,effort:4}))};
    });
    const restDays = Object.fromEntries([0,4,6].map(offset => [key(day(offset)),true]));
    const profile = {id:userId,firstName:"Alex",username:"alex_demo",name:"Alex",age:28,heightCm:180,weightKg:80,bodyweight:80,gender:"Male",experience:"Intermediate",trainingGoal:"Strength",sessionsPerWeekTarget:4,createdAt:new Date(now-90*86400000).toISOString()};
    profileStore.setState({initialized:true,ownerId:userId,profile,termsAccepted:true,startCompleted:true,init:async()=>{},settings:{...profileStore.getState().settings,language:"en",visualizationMode:"default",hasCompletedOnboarding:true,hasSeenQrTutorial:true,hasSeenModelTutorial:true,hasSeenWeekTutorial:true,hasSeenPrTutorial:true,hasSeenCommunityTutorial:true,weightReminderLastUpdatedAt:new Date(now).toISOString()}});
    authStore.setState({initialized:true,user:{id:userId,email:"demo@example.invalid",email_confirmed_at:"2026-01-01",is_anonymous:false},error:null,refresh:async()=>{}});
    const router = modules.find(module => module?.router && module?.useRouter)?.router;
    globalThis.captureRouter = router;
    globalThis.restoreRecoveryFixture = () => trainingStore.setState({initialized:true,logs,restDays,dayNotes:{},init:async()=>{}});
    globalThis.restoreRecoveryFixture();
    router.replace("/week");
  });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { globalThis.restoreRecoveryFixture(); globalThis.captureRouter.replace("/week"); });
  await page.waitForTimeout(1500);
  console.log("Before capture", page.url(), (await page.locator("body").innerText()).slice(0,1600));
  await page.screenshot({ path: "artifacts/recovery/before-capture.png" });
  await page.getByText(/^(Vorige|Previous)$/).click();
  await page.waitForTimeout(2000);
  console.log((await page.locator("body").innerText()).slice(0,1200));
  await page.screenshot({ path: "public/marketing/overview-current.png" });
  if (process.argv.includes("--analysis") || process.argv.includes("--comparison")) {
    await page.getByText(await page.evaluate(() => globalThis.captureDayLabel), { exact: true }).click();
    if (process.argv.includes("--analysis")) {
    await page.getByText("Daganalyse", { exact: true }).filter({ visible: true }).click();
    // Let the app's first-open XP toast finish before capturing the screen.
    await page.waitForTimeout(5500);
    await page.screenshot({ path: "artifacts/recovery/day-analysis.png" });
    } else {
    await page.getByRole("button", { name: "Vergelijken met een andere workoutdag" }).click();
    await page.getByRole("button", { name: /^Vergelijk met / }).first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: "artifacts/recovery/day-comparison.png" });
    }
    console.log("Saved actual app detail screen.");
    await context.close();
  } else {
  await page.waitForTimeout(6500);
  const video = page.video();
  await context.close();
  await video.saveAs("artifacts/recovery/app-recording.webm");
  console.log("Saved current app poster and recording.");
  }
} finally { await browser.close(); }
