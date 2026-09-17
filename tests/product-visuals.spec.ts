import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/analytics/website-visit", route => route.fulfill({ status: 204 }));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
});

for (const [width, height] of [[320, 568], [360, 640], [390, 844], [430, 932], [768, 1024], [1024, 900], [1440, 1000], [1920, 1080]]) {
  test(`PR details, Groups screenshot and demo note at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const records = page.locator("#records");
    const group = page.locator("#community");
    const final = page.locator("#waitlist");
    const details = page.locator("#pr-details");
    await expect(records.locator("img")).toHaveCount(0);
    await expect(group.getByRole("img", { name: /Actual MyMuscle Groups screen/ })).toBeAttached();
    await expect(group.getByRole("link", { name: "View full Groups screenshot (opens in a new tab)" })).toHaveAttribute("href", "/marketing/groups-app-hd.webp");
    await expect(records.getByRole("button")).toHaveCount(3);
    await expect(details).toBeEmpty();
    for (const [lift, weight, date] of [["Bench Press", "80", "2026-03-12"], ["Squat", "110", "2026-03-18"], ["Deadlift", "140", "2026-03-24"]]) {
      const button = page.getByRole("button", { name: `${lift} PR details` });
      await button.focus();
      await page.keyboard.press("Enter");
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await expect(details.getByRole("heading")).toHaveText(lift);
      await expect(details.locator("time")).toHaveAttribute("datetime", date);
      await expect(details.locator("dd").nth(1)).toHaveText(`${weight} kg`);
      await expect(details.locator("dd").nth(2)).toHaveText("1");
      await expect(records.locator('[aria-expanded="true"]')).toHaveCount(1);
    }
    await expect(records.locator("figure")).toHaveAttribute("data-revealed", "true");
    await expect(final).toContainText("This website is an interactive demo.");
    await expect(final).toContainText("the full MyMuscle experience in the app.");
    for (const section of [records, group, final]) {
      await section.evaluate(element => element.scrollIntoView({ behavior: "instant", block: "start" }));
      const size = await section.evaluate(element => ({ height: element.getBoundingClientRect().height, overflow: element.scrollWidth > element.clientWidth }));
      expect(size.overflow).toBe(false);
      if (width >= 360 && width <= 800) expect(size.height).toBeLessThanOrEqual(height + 1);
    }
    await page.getByRole("button", { name: "Deadlift PR details" }).click();
    await expect(details).toBeEmpty();
    await expect(page.getByRole("button", { name: "Deadlift PR details" })).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("PR details and demo note are accessible and respect reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Squat PR details" }).click();
  const animations = await page.locator("#records figure *").evaluateAll(elements => elements.filter(element => getComputedStyle(element).animationName !== "none").length);
  expect(animations).toBe(0);
  const audit = await new AxeBuilder({ page }).include("#records").include("#community").include("#waitlist").exclude('[class*="finalWatermark"]').withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(audit.violations).toEqual([]);
});
