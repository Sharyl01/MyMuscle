import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  exercises,
  groupForMesh,
  muscleGroups,
  validDemoSet,
} from "../src/components/marketing/demo-data";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/analytics/website-visit", (route) =>
    route.fulfill({ status: 204 }),
  );
});

async function home(page: Page) {
  await page.goto("/");
  await expect(page.locator("[data-model-status]")).toHaveAttribute(
    "data-model-status",
    "ready",
  );
  await page.evaluate(() => document.fonts.ready);
}

async function selectMuscle(page: Page, name: (typeof muscleGroups)[number]) {
  const model = page.getByRole("group", { name: /^Interactive muscle model/ });
  await model.focus();
  await page.keyboard.press("Home");
  for (let index = 0; index < muscleGroups.indexOf(name); index++) await page.keyboard.press("ArrowDown");
}

test("real mesh picking, mouse rotation, set registration, colors and reset", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await home(page);
  const canvas = page.locator("canvas");
  const bounds = (await canvas.boundingBox())!;
  await page.mouse.click(
    bounds.x + bounds.width * 0.47,
    bounds.y + bounds.height * 0.26,
  );
  await expect(
    page.getByRole("heading", { name: "Chest selected." }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Bench Press", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Incline Bench Press", exact: true })).toBeVisible();
  await expect(page.getByLabel("Reps", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Bench Press", exact: true }).click();
  await page.mouse.move(1, 1);
  await page.waitForTimeout(650);
  const before = await canvas.screenshot();
  await page.getByRole("button", { name: "Add set", exact: true }).click();
  await page.getByRole("button", { name: "Save workout" }).click();
  await expect(
    page.getByRole("heading", { name: "A strong start.", level: 2 }),
  ).toBeAttached();
  await expect(page.getByRole("status")).toContainText(
    "1 set logged",
  );
  await page.waitForTimeout(650);
  expect((await canvas.screenshot()).equals(before)).toBe(false);
  await expect(page.getByRole("status")).toContainText("8 × 80 kg");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(
    page.getByRole("heading", { name: "One muscle. Your first set." }),
  ).toBeVisible();
  await expect(page.getByLabel("Weight in kilograms")).toHaveCount(0);
  await page.waitForTimeout(650);
  const front = await canvas.screenshot();
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 130, box.y + box.height / 2, {
    steps: 15,
  });
  await page.mouse.up();
  await page.mouse.move(1, 1);
  await page.waitForTimeout(650);
  expect((await canvas.screenshot()).equals(front)).toBe(false);
  await expect(
    page.getByRole("heading", { name: "One muscle. Your first set." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Rotate model right" }).focus();
  await page.keyboard.press("Enter");
  await selectMuscle(page, "Hamstrings");
  await expect(
    page.getByRole("heading", { name: "Hamstrings selected." }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Leg Curl", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("muscle feedback follows cumulative colors, muscle selection and reset", async ({ page }) => {
  await home(page);
  await selectMuscle(page, "Chest");
  const feedback = page.locator("[data-load-step]");
  const stages = [
    ["Very light", "A strong start."],
    ["Light", "Finding your rhythm."],
    ["Light–moderate", "Every set adds up."],
    ["Moderate", "A solid foundation."],
  ];
  for (const [index, [, headline]] of stages.entries()) {
    if (index) await page.getByRole("button", { name: "Log another workout" }).click();
    await page.getByRole("button", { name: "Bench Press", exact: true }).click();
    await page.getByRole("button", { name: "Add set", exact: true }).click();
    await page.getByRole("button", { name: "Save workout" }).click();
    await expect(feedback).toHaveAttribute("data-load-step", String(index + 1));
    await expect(feedback.getByRole("heading")).toHaveText(headline);
    await expect(feedback).not.toContainText("Chest /");
  }
  await selectMuscle(page, "Abs");
  await expect(feedback.getByRole("heading")).toHaveText("Abs selected.");
  await selectMuscle(page, "Chest");
  await expect(feedback.getByRole("heading")).toHaveText("A solid foundation.");
  await selectMuscle(page, "Triceps");
  await expect(feedback).not.toHaveAttribute("data-load-step", "0");
  await expect(feedback).not.toContainText("Overloaded");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(feedback).toBeEmpty();
  await selectMuscle(page, "Chest");
  await expect(feedback).toHaveAttribute("data-load-step", "0");
});

test("badge clicks and keyboard access reveal the matching unlock conditions", async ({ page }) => {
  await home(page);
  const bronze = page.getByRole("button", { name: "Bronze Pull-up badge requirements" });
  await bronze.click();
  const panel = page.locator("#badge-requirements");
  await expect(bronze).toHaveAttribute("aria-expanded", "true");
  await expect(panel).toContainText("Strict pull-ups in a single set. No kipping.");
  await expect(panel).toContainText("5 reps");
  await expect(panel).toContainText("1 rep");
  await page.getByRole("button", { name: "Gold Bench Press badge requirements" }).focus();
  await page.keyboard.press("Enter");
  await expect(bronze).toHaveAttribute("aria-expanded", "false");
  await expect(panel.getByRole("heading")).toHaveText("Gold Bench Press");
  await expect(panel).toContainText("80 kg");
  await expect(panel).toContainText("40 kg");
  await page.getByRole("button", { name: "Platinum Ratio Squat badge requirements" }).click();
  await expect(panel.locator("dd")).toHaveText(["1.6 × BW", "1.6 × BW"]);
  await expect(panel).toContainText("1.6 times your bodyweight");
  await page.getByRole("button", { name: "Platinum Ratio Squat badge requirements" }).click();
  await expect(panel).toBeEmpty();
});

test("mobile touch rotates without selecting, and tap selects a muscle", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.route("**/api/analytics/website-visit", (route) =>
    route.fulfill({ status: 204 }),
  );
  await home(page);
  await page.locator("canvas").scrollIntoViewIfNeeded();
  const before = await page.locator("canvas").screenshot();
  const box = (await page.locator("canvas").boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const x = Math.round(box.x + box.width / 2),
    y = Math.round(box.y + box.height / 2);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let move = 10; move <= 110; move += 10)
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x + move, y }],
    });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await page.waitForTimeout(150);
  expect((await page.locator("canvas").screenshot()).equals(before)).toBe(
    false,
  );
  await expect(
    page.getByText("Tap a muscle to explore its exercises.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.locator("canvas").scrollIntoViewIfNeeded();
  const tapBox = (await page.locator("canvas").boundingBox())!;
  await page.touchscreen.tap(
    tapBox.x + tapBox.width * 0.47,
    tapBox.y + tapBox.height * 0.26,
  );
  await expect(
    page.getByRole("heading", { name: "Chest selected." }),
  ).toBeAttached();
  await page.getByRole("button", { name: "Bench Press", exact: true }).click();
  await page.getByRole("button", { name: "Add set", exact: true }).click();
  await page.getByRole("button", { name: "Save workout" }).click();
  await expect(
    page.getByRole("heading", { name: "A strong start.", level: 2 }),
  ).toBeAttached();
  await expect(page.getByRole("link", { name: "Download MyMuscle on the App Store" }).first()).toHaveAttribute("href", "https://apps.apple.com/nl/app/mymuscle-workout-tracker/id6815727446");
  await context.close();
});

for (const width of [360, 430, 768, 1280, 1920]) {
  test(`responsive layout and media at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await home(page);
    if (width > 800) {
      await expect.poll(async () => {
        const heights = await page.locator("#overview,#progress,#records,#community").evaluateAll(sections => sections.map(section => section.getBoundingClientRect().height));
        return Math.max(...heights) - Math.min(...heights);
      }).toBeLessThanOrEqual(1);
    }
    for (const id of [
      "overview",
      "progress",
      "records",
      "achievements",
      "community",
      "waitlist",
    ]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page
        .locator(`#${id} img`)
        .evaluateAll((images) =>
          Promise.all(
            images.map((image) => (image as HTMLImageElement).decode()),
          ),
        );
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width <= 800) {
      const spacing = await page.locator("#overview,#progress,#records,#community").evaluateAll(sections => sections.map(section => {
        const label = section.firstElementChild!.getBoundingClientRect();
        const title = section.querySelector("h2")!.getBoundingClientRect();
        const screen = section.querySelector("figure")!.getBoundingClientRect();
        return { aboveTitle: title.top - label.bottom, belowScreen: section.getBoundingClientRect().bottom - screen.bottom };
      }));
      for (const gap of spacing) {
        expect(gap.aboveTitle).toBeGreaterThanOrEqual(0);
        expect(gap.aboveTitle).toBeLessThanOrEqual(40);
        expect(gap.belowScreen).toBeGreaterThanOrEqual(0);
        // Viewport chapters center their content, so spare space can remain below.
        expect(gap.belowScreen).toBeLessThanOrEqual(500);
      }
    }
    expect(
      await page
        .locator("main img")
        .evaluateAll((images) =>
          images.every((image) => (image as HTMLImageElement).naturalWidth > 0),
        ),
    ).toBe(true);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({
      path: `artifacts/redesign/verified-${width}.png`,
      fullPage: true,
    });
  });
}

test("live store buttons replace the launch waitlist in the header and final section", async ({
  page,
}) => {
  await page.goto("/");
  for (const section of [page.getByRole("banner"), page.locator("#waitlist")]) {
    const apple = section.getByRole("link", { name: "Download MyMuscle on the App Store" });
    const google = section.getByRole("link", { name: "Download MyMuscle on Google Play" });
    await expect(apple).toHaveAttribute("href", "https://apps.apple.com/nl/app/mymuscle-workout-tracker/id6815727446");
    await expect(google).toHaveAttribute("href", "https://play.google.com/store/apps/details?id=com.apphletes.mymuscle");
    await apple.focus();
    await expect(apple).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(google).toBeFocused();
  }
  await expect(page.getByRole("button", { name: "Join Waitlist" })).toHaveCount(0);
});

test("download redirects select the correct live store for each phone", async ({
  request,
}) => {
  for (const [agent, destination] of [
    ["iPhone", "https://apps.apple.com/nl/app/mymuscle-workout-tracker/id6815727446"],
    ["Android", "https://play.google.com/store/apps/details?id=com.apphletes.mymuscle"],
  ]) {
    const response = await request.get("/download", { headers: { "user-agent": agent }, maxRedirects: 0 });
    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe(destination);
  }
});

test("release notices announce the live apps", async ({
  page,
}) => {
  await page.goto("/");
  const notices = page.getByRole("note", { name: "App release status" });
  await expect(notices).toHaveCount(2);
  for (const notice of await notices.all()) {
    await expect(notice).toContainText("MyMuscle is live");
    await expect(notice).toContainText("Available now on the App Store and Google Play.");
  }
  await expect(page.getByRole("timer")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("banner").getByRole("note", { name: "App release status" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("fallback is usable without WebGL, and failed model requests recover", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl2") return null;
      return original.call(this, type as "2d", ...args);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator("[data-model-status]")).toHaveAttribute(
    "data-model-status",
    "fallback",
  );
  await page
    .getByRole("button", { name: "Chest", exact: false })
    .first()
    .click();
  await page.getByRole("button", { name: "Bench Press", exact: true }).click();
  await page.getByRole("button", { name: "Add set", exact: true }).click();
  await page.getByRole("button", { name: "Save workout" }).click();
  await expect(
    page.getByRole("heading", { name: "A strong start.", level: 2 }),
  ).toBeAttached();
  await expect(page.locator("#waitlist").getByRole("link", { name: "Download MyMuscle on Google Play" })).toBeAttached();
});

test("failed GLB fetch keeps a neutral fallback without a poster", async ({ page }) => {
  await page.route("**/marketing/male-body.glb", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator("[data-model-status]")).toHaveAttribute(
    "data-model-status",
    "fallback",
  );
  await expect(page.locator("[data-neutral-loading]")).toBeVisible();
  await expect(page.locator("[data-model-status] img")).toHaveCount(0);
});

test("slow 3D loading has no poster, no asset swap and no layout shift", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/marketing/male-body.glb", async route => { await gate; await route.continue(); });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("[data-neutral-loading]")).toBeVisible();
  await expect(page.locator("[data-model-status] img")).toHaveCount(0);
  await expect(page.locator("#experience button").filter({ hasText: "Join Waitlist" })).toHaveCount(0);
  const before = await page.locator("[data-model-status]").boundingBox();
  release();
  await expect(page.locator("[data-model-status]")).toHaveAttribute("data-model-status", "ready");
  await expect(page.locator("[data-neutral-loading]")).toHaveCount(0);
  expect(await page.locator("[data-model-status]").boundingBox()).toEqual(before);
  await expect(page.locator("#waitlist").getByRole("link", { name: "Download MyMuscle on the App Store" })).toBeAttached();
  await expect(page.locator("#waitlist").getByRole("note", { name: "App release status" })).toBeAttached();
});

test("app preview requires exercise choice and supports draft sets, intensity, removal and save", async ({ page }) => {
  await home(page);
  await page.getByRole("button", { name: "Chest", exact: true }).click();
  await expect(page.getByRole("region", { name: "Chest workout preview" }).getByRole("button")).toHaveCount(3);
  await page.getByRole("button", { name: "Incline Bench Press", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save workout" })).toBeDisabled();
  await page.getByLabel("Reps", { exact: true }).fill("10");
  await page.getByLabel("Weight in kilograms").fill("62.5");
  await page.getByLabel("Intensity", { exact: true }).fill("4");
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Add set", exact: true }).click();
  await expect(page.getByRole("button", { name: "Add set", exact: true })).toBeEnabled();
  await expect(page.getByRole("heading", { name: "Chest selected." })).toBeAttached();
  await page.getByRole("button", { name: "Remove set 2" }).click();
  await page.getByRole("button", { name: "Save workout" }).click();
  await expect(page.getByRole("status")).toContainText("2 sets logged");
  await expect(page.getByRole("status")).toContainText("10 × 62.5 kg");
  await selectMuscle(page, "Back");
  await page.getByRole("button", { name: "Pull-up", exact: true }).click();
  await expect(page.getByLabel("Weight in kilograms")).toHaveCount(0);
  await expect(page.getByText("Example profile", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Change exercise", exact: false }).click();
  await expect(page.getByRole("button", { name: "Lat Pulldown", exact: true })).toBeVisible();
});

test("SEO, legal links, protected admin route, and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await home(page);
  await expect(page).toHaveTitle("MyMuscle — See your training.");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://mymuscle.app",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /social-preview.png$/,
  );
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("img", { name: /Actual MyMuscle Barbell Bench Press screen/ })).toBeAttached();
  await expect(page.locator("#progress svg")).toHaveCount(0);
  for (const path of [
    "/privacy",
    "/terms",
    "/robots.txt",
    "/sitemap.xml",
    "/marketing/social-preview.png",
  ])
    expect((await page.request.get(path)).status()).toBe(200);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(
    page.getByRole("heading", { name: "Welkom terug" }),
  ).toBeVisible();
  await expect(page.locator('[class*="marketing"]')).toHaveCount(0);
  expect((await page.request.get("/dashboard")).status()).toBe(404); // Existing baseline; no route added or changed.
});

test("demo input bounds and actual model mesh mapping", () => {
  expect(validDemoSet(80, 8)).toBe(true);
  expect(validDemoSet(0, 1)).toBe(true);
  for (const [weight, reps] of [
    [NaN, 8],
    [-1, 8],
    [501, 8],
    [80, 0],
    [80, 1.5],
    [80, 101],
  ])
    expect(validDemoSet(weight, reps)).toBe(false);
  expect(Object.values(exercises).every(items => items.length === 2)).toBe(true);
  expect(groupForMesh("upper_chest_l")).toBe("Chest");
  expect(groupForMesh("lower_traps_r")).toBe("Back");
  expect(groupForMesh("rear_delt_l")).toBe("Shoulders");
  expect(groupForMesh("head")).toBeNull();
});

test("WebGL is idle between interactions and while the hero is offscreen", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = WebGL2RenderingContext.prototype.drawElements;
    (window as unknown as { modelDraws: number }).modelDraws = 0;
    WebGL2RenderingContext.prototype.drawElements = function (...args) {
      (window as unknown as { modelDraws: number }).modelDraws++;
      return original.apply(this, args);
    };
  });
  const draws = () =>
    page.evaluate(
      () => (window as unknown as { modelDraws: number }).modelDraws,
    );
  await home(page);
  await page.waitForTimeout(1500);
  const idle = await draws();
  expect(idle).toBeGreaterThan(0);
  await page.waitForTimeout(400);
  expect(await draws()).toBe(idle);
  await page
    .getByRole("button", { name: "Chest", exact: false })
    .first()
    .click();
  await page.waitForTimeout(1500);
  expect(await draws()).toBeGreaterThan(idle);
  await page.locator("#community").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const offscreen = await draws();
  await page
    .getByRole("button", { name: "Reset demo" })
    .evaluate((button) => (button as HTMLButtonElement).click());
  await page.waitForTimeout(400);
  expect(await draws()).toBe(offscreen);
});

test("public page and live download buttons meet automated WCAG accessibility checks", async ({
  page,
}) => {
  await home(page);
  // The aria-hidden wordmark is decorative artwork, exempt from text contrast.
  const pageAudit = await new AxeBuilder({ page })
    .exclude('[class*="finalWatermark"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(pageAudit.violations).toEqual([]);
});
