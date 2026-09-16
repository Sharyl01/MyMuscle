import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

// Real app rendering in an isolated browser. All external traffic is blocked.
// Fixture state lives in this browser's memory; app source and accounts are untouched.
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
const context = await browser.newContext({ viewport: { width: 430, height: 840 }, deviceScaleFactor: 3 });
const page = await context.newPage();
page.on("pageerror", error => console.log("PAGE ERROR", error.message));
page.on("console", message => { if (message.type() === "error") console.log("CONSOLE ERROR", message.text()); });
await mkdir("artifacts/refinement", { recursive: true });
await page.route("**/*", route => {
  const url = new URL(route.request().url());
  if (["localhost", "127.0.0.1"].includes(url.hostname)) return route.continue();
  return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
});
try {
  await page.goto(process.env.MYMUSCLE_APP_URL || "http://localhost:8081", { timeout: 60000 });
  await page.waitForFunction(() => globalThis.__r?.getModules && document.body.innerText.includes("Inloggen"));
  const result = await page.evaluate(() => {
    const modules = Array.from(globalThis.__r.getModules().values()).map(module => module.publicModule.exports);
    const get = key => modules.find(module => module?.[key])?.[key];
    const profileStore = get("useProfileStore"), authStore = get("useAuthStore"), trainingStore = get("useTrainingStore"), prStore = get("usePRStore");
    const userId = "00000000-0000-4000-8000-000000000001";
    const now = Date.now();
    const profile = { id: userId, firstName: "Alex", username: "alex_demo", name: "Alex", age: 28, heightCm: 180, weightKg: 80, bodyweight: 80, gender: "Male", experience: "Intermediate", trainingGoal: "Strength", sessionsPerWeekTarget: 4, createdAt: new Date(now - 90*86400000).toISOString() };
    profileStore.setState({ initialized: true, ownerId: userId, profile, termsAccepted: true, startCompleted: true, init: async () => {}, settings: { ...profileStore.getState().settings, language: "en", hasCompletedOnboarding: true, hasSeenQrTutorial: true, hasSeenModelTutorial: true, hasSeenWeekTutorial: true, hasSeenPrTutorial: true, hasSeenCommunityTutorial: true, exerciseChartUnlockedExerciseId: "bench-press", weightReminderLastUpdatedAt: new Date(now).toISOString() } });
    authStore.setState({ initialized: true, user: { id: userId, email: "demo@example.invalid", email_confirmed_at: "2026-01-01", is_anonymous: false }, error: null, refresh: async () => {} });
    const exercise = get("EXERCISE_DB")?.find(exercise => exercise.id === "bench-press");
    const logs = [60,62.5,65,65,67.5,70,70,72.5,75,77.5,80].map((weight, index) => ({ id:`website-demo-${index}`, exerciseId:"bench-press", exercise:"Barbell Bench Press", ts:now-(28-index*2.5)*86400000, sets:[{weight,reps:1,effort:3},{weight,reps:8,effort:3},{weight:weight-5,reps:10,effort:3}], weights:exercise?.weights ?? {upper_chest:.3,lower_chest:.4,triceps:.2} }));
    trainingStore.setState({ initialized:true, logs, restDays:{}, dayNotes:{}, init:async()=>{} });
    const records = logs.map(log=>({ id:log.id, originLogId:log.id, exerciseId:"bench-press",exerciseName:"Barbell Bench Press",weight:log.sets[0].weight,reps:1,score:log.sets[0].weight,ts:log.ts,muscleId:"upper_chest",type:"oneRepMax" }));
    prStore.setState({ initialized:true, byExercise:{"bench-press":{current:{oneRepMax:records.at(-1)},history:records.slice(0,-1)}}, trackedExerciseIds:["bench-press","squat","db-bench-press"],init:async()=>{} });
    const router = modules.find(module => module?.router && module?.useRouter)?.router;
    globalThis.captureRouter = router;
    globalThis.captureStores = get;
    globalThis.restoreFixture = () => {
      trainingStore.setState({ initialized:true, logs, restDays:{}, dayNotes:{}, init:async()=>{} });
      prStore.setState({ initialized:true, byExercise:{"bench-press":{current:{oneRepMax:records.at(-1)},history:records.slice(0,-1)}}, trackedExerciseIds:["bench-press","squat","db-bench-press"],init:async()=>{} });
      profileStore.setState({ settings:{...profileStore.getState().settings,language:"en",exerciseChartUnlockedExerciseId:"bench-press"} });
    };
    router.replace("/exercise/bench-press?tab=chart");
    return { exerciseFound:!!exercise, routerFound:!!router };
  });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { globalThis.restoreFixture(); globalThis.captureRouter.replace("/exercise/bench-press?tab=chart"); });
  await page.waitForTimeout(2000);
  console.log(result, page.url(), (await page.locator("body").innerText()).slice(0,3000));
  await page.screenshot({ path:"artifacts/refinement/strength-app.png", fullPage:true });
  await page.setViewportSize({width:430,height:1040});
  await page.evaluate(() => {
    const store=globalThis.captureStores("usePRStore");
    const byExercise={...store.getState().byExercise};
    [["db-bench-press","Dumbbell Bench Press",32.5],["squat","Squat",110],["barbell-deadlift","Conventional Deadlift",140]].forEach(([id,name,weight])=>{
      const record={id:`demo-pr-${id}`,originLogId:`demo-log-${id}`,exerciseId:id,exerciseName:name,weight,reps:1,score:weight,ts:Date.now()-86400000,type:"oneRepMax"};
      byExercise[id]={current:{oneRepMax:record},history:[{...record,id:`earlier-${id}`,weight:weight-5,score:weight-5,ts:Date.now()-7*86400000}]};
    });
    store.setState({byExercise});
  });
  await page.evaluate(() => globalThis.captureRouter.replace("/prs"));
  await page.waitForTimeout(1500);
  console.log("PRS", (await page.locator("body").innerText()).slice(0,1200));
  await page.screenshot({path:"artifacts/refinement/pr-app.png",fullPage:true});
  await page.evaluate(() => {
    const store=globalThis.captureStores("useLeaderboardStore");
    const members=["Alex","Jamie","Sam"].map((name,i)=>({id:`demo-${i}`,username:name.toLowerCase(),name,totalScore:42000-i*4000,prCount:12-i*2,level:8-i,streakWeeks:5-i,sex:"male",topLifts:["bench-press"],latestPR:{exerciseId:"bench-press",exerciseName:"Barbell Bench Press",weight:100-i*10,reps:1,ts:Date.now()-i*86400000}}));
    store.setState({initialized:true,groups:[{id:"training-club",name:"The Training Club",description:"Show up. Get stronger. Together.",joinCode:"DEMO",visibility:"public",hostId:"demo-0",members}],memberships:["training-club"],init:async()=>{}});
    globalThis.captureRouter.replace("/leaderboard");
  });
  await page.waitForTimeout(1500);
  console.log("GROUPS",(await page.locator("body").innerText()).slice(0,1500));
  await page.screenshot({path:"artifacts/refinement/groups-app.png",fullPage:true});
  await page.evaluate(() => globalThis.captureRouter.replace("/week"));
  await page.waitForTimeout(2000);
  console.log("OVERVIEW",(await page.locator("body").innerText()).slice(-1800));
  await page.screenshot({path:"artifacts/refinement/overview-app.png",fullPage:true});
  await context.storageState({ path:"artifacts/refinement/capture-state.json" });
} finally { await browser.close(); }

