import { test, expect } from "@playwright/test";
import notice from "../src/app/privacy/privacy-notice.json";
import terms from "../src/app/terms/terms-notice.json";

test("shows the full shared Dutch privacy statement and terms on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [route, legalDocument] of [["/privacy", notice], ["/terms", terms]] as const) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const main = page.locator("main");
    await expect(page.locator('[lang="nl"]')).toBeVisible();
    await expect(main).toContainText(legalDocument.version);
    await expect(main.getByRole("img", { name: "Apphletes", exact: true })).toBeVisible();
    expect(await main.locator("section").count()).toBe(legalDocument.sections.length);
    for (const section of legalDocument.sections) {
      await expect(main.getByRole("heading", { name: section.title, exact: true })).toBeVisible();
      for (const paragraph of section.body) await expect(main.getByText(paragraph, { exact: true })).toHaveCount(1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await page.locator('[lang="nl"]').evaluate(el => getComputedStyle(el).backgroundColor)).toBe("rgb(255, 255, 255)");
  }
  await page.goto("/privacy");
  await page.screenshot({ path: "test-results/privacy-mobile.png", fullPage: true });
});
