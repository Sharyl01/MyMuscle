import { test, expect, type Page } from "@playwright/test";

const chapters = "#experience,#overview,#progress,#records,#achievements,#community,#waitlist";

async function openHome(page: Page) {
  await page.route("**/api/analytics/website-visit", route => route.fulfill({ status: 204 }));
  await page.goto("/");
  await expect(page.locator("[data-model-status]")).toHaveAttribute("data-model-status", "ready");
  await page.evaluate(() => document.fonts.ready);
}

async function frameHero(page: Page) {
  await page.locator("#experience").evaluate(element => element.scrollIntoView({ behavior: "instant", block: "start" }));
}

for (const [width, height] of [[320, 568], [360, 640], [375, 667], [390, 844], [430, 932], [768, 1024], [667, 375]]) {
  test(`mobile chapters and complete workout at ${width}x${height}`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const page = await context.newPage();
    await openHome(page);
    const bounds = await page.locator(chapters).evaluateAll(elements => elements.map(element => ({
      height: element.getBoundingClientRect().height,
      overflow: element.scrollWidth > element.clientWidth,
    })));
    for (const section of bounds) {
      expect(section.overflow).toBe(false);
      expect(section.height).toBeGreaterThanOrEqual(height);
      // Tiny/landscape screens retain natural scrolling instead of clipping content.
      if (width >= 360 && height >= 640) expect(section.height).toBeLessThanOrEqual(height + 1);
    }
    await frameHero(page);
    await expect(page.locator("canvas")).toBeInViewport({ ratio: 1 });
    await page.getByRole("button", { name: "Chest", exact: true }).tap();
    await expect(page.getByRole("button", { name: "Bench Press", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Incline Bench Press", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Bench Press", exact: true }).tap();
    await page.getByRole("button", { name: "Add set", exact: true }).tap();
    await frameHero(page);
    await expect(page.locator("canvas")).toBeInViewport({ ratio: 1 });
    if (height >= 667) await expect(page.getByRole("button", { name: "Save workout" })).toBeInViewport({ ratio: 1 });
    await page.screenshot({ path: `artifacts/mobile-chapters/verified-${width}x${height}.png` });
    // More sets must grow the chapter and remain removable/reachable.
    for (let index = 0; index < 5; index++) await page.getByRole("button", { name: "Add set", exact: true }).tap();
    await page.getByRole("button", { name: "Remove set 6", exact: true }).tap();
    await page.getByRole("button", { name: "Save workout" }).tap();
    await expect(page.getByRole("status")).toContainText("5 sets logged");
    await page.getByRole("button", { name: "Reset demo" }).tap();
    await page.getByRole("button", { name: "Gold Bench Press badge requirements" }).tap();
    await expect(page.locator("#badge-requirements")).toContainText("80 kg");
    await page.locator("#community").scrollIntoViewIfNeeded();
    await expect(page.locator("#community h2")).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await context.close();
  });
}

test("native proximity snap allows forward/backward scrolling and stays on the homepage", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page);
  const snap = () => page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType);
  expect(await snap()).toBe("y"); // CSSOM serializes the default proximity value implicitly.
  await frameHero(page);
  await page.mouse.move(8, 400);
  await page.mouse.wheel(0, 780);
  await expect.poll(() => page.locator("#overview").evaluate(element => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(2);
  await page.mouse.wheel(0, 844);
  await expect.poll(() => page.locator("#progress").evaluate(element => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(2);
  await page.mouse.wheel(0, -844);
  await expect.poll(() => page.locator("#overview").evaluate(element => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(2);
  await page.setViewportSize({ width: 1440, height: 1000 });
  expect(await snap()).toBe("none");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await snap()).toBe("none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByRole("link", { name: "Privacy Policy", exact: true }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  expect(await snap()).toBe("none");
});

test("snap releases focused inputs and keeps expanded workout controls reachable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await openHome(page);
  await page.getByRole("button", { name: "Chest", exact: true }).click();
  await page.getByRole("button", { name: "Bench Press", exact: true }).click();
  await page.getByRole("spinbutton", { name: "Reps", exact: true }).fill("10");
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType)).toBe("none");
  for (let index = 0; index < 8; index++) await page.getByRole("button", { name: "Add set", exact: true }).click();
  await page.getByRole("button", { name: "Remove set 8", exact: true }).click();
  await page.getByRole("button", { name: "Save workout" }).click();
  await expect(page.getByRole("status")).toContainText("7 sets logged");
  await page.getByRole("button", { name: "Explore another muscle" }).click();
  await expect(page.getByRole("button", { name: "Chest", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Gold Bench Press badge requirements" }).click();
  await expect(page.locator("#badge-requirements")).toContainText("80 kg");
  await page.getByRole("button", { name: "Join Waitlist" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType)).toBe("none");
  await page.getByRole("button", { name: "Close waitlist form" }).click();
});
