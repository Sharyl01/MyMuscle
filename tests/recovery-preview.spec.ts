import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/analytics/website-visit", route => route.fulfill({ status: 204 }));
});

test("the actual app recovery animation loads on hover, moves, and pauses offscreen", async ({ page }) => {
  await page.goto("/");
  const video = page.locator("#overview video");
  await expect(video).not.toHaveAttribute("src");
  const trigger = page.getByRole("button", { name: "Play recovery animation" });
  await trigger.hover();
  await expect(video).toHaveAttribute("data-playing", "true");
  // Regression: the app must fill the video, without a large grey recording canvas.
  const greyFraction = await video.evaluate(element => {
    const canvas = document.createElement("canvas");
    canvas.width = 86; canvas.height = 212;
    const context = canvas.getContext("2d")!;
    context.drawImage(element as HTMLVideoElement, 0, 0, 86, 212);
    const pixels = context.getImageData(0, 0, 86, 212).data;
    let grey = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] >= 120 && pixels[i] <= 136 && Math.abs(pixels[i] - pixels[i + 1]) < 3 && Math.abs(pixels[i] - pixels[i + 2]) < 3) grey++;
    }
    return grey / (86 * 212);
  });
  expect(greyFraction).toBeLessThan(0.2);
  const before = await video.screenshot();
  const time = await video.evaluate(element => (element as HTMLVideoElement).currentTime);
  await expect.poll(() => video.evaluate(element => (element as HTMLVideoElement).currentTime)).not.toBe(time);
  await page.waitForTimeout(400);
  expect((await video.screenshot()).equals(before)).toBe(false);
  await page.mouse.move(1, 1);
  await expect(video).toHaveAttribute("data-playing", "false");
  await trigger.click();
  await expect(video).toHaveAttribute("data-playing", "true");
  await page.locator("#waitlist").scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute("data-playing", "false");
});

test("mobile users can play and pause recovery with a tap", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.route("**/api/analytics/website-visit", route => route.fulfill({ status: 204 }));
  await page.goto("/");
  const video = page.locator("#overview video");
  await page.getByRole("button", { name: "Play recovery animation" }).tap();
  await expect(video).toHaveAttribute("data-playing", "true");
  await page.getByRole("button", { name: "Pause recovery animation" }).tap();
  await expect(video).toHaveAttribute("data-playing", "false");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test("overview switches to real comparison and analysis screens and resumes recovery", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Make recovery visible/ }).click();
  await expect(page.locator("#overview video")).toHaveAttribute("data-playing", "true");
  await page.getByRole("button", { name: /Make recovery visible/ }).click();
  await expect(page.locator("#overview video")).toHaveAttribute("data-playing", "true");
  await page.getByRole("button", { name: /Compare your training days/ }).click();
  await expect(page.locator("#overview video")).toHaveCount(0);
  await expect(page.getByRole("img", { name: /Actual MyMuscle workout comparison/ })).toBeVisible();
  await page.getByRole("button", { name: /Get your day analysis/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("img", { name: /Actual MyMuscle day analysis/ })).toBeVisible();
  await page.getByRole("button", { name: /See what you trained/ }).click();
  await expect(page.locator("#overview video")).toHaveAttribute("data-playing", "false");
  await page.getByRole("button", { name: /Make recovery visible/ }).click();
  await expect(page.locator("#overview video")).toHaveAttribute("data-playing", "true");
});

test("reduced motion suppresses automatic hover playback and keeps keyboard play available", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Play recovery animation" });
  const video = page.locator("#overview video");
  await trigger.hover();
  await expect(video).toHaveAttribute("data-playing", "false");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(video).toHaveAttribute("data-playing", "true");
  await page.keyboard.press("Enter");
  await expect(video).toHaveAttribute("data-playing", "false");
});
