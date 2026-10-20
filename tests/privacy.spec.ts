import { test, expect } from "@playwright/test";
import notice from "../src/app/privacy/privacy-notice.json";
import terms from "../src/app/terms/terms-notice.json";

test("legal pages allow anonymous GET and HEAD requests without an authentication redirect", async ({ request }) => {
  for (const route of ["/privacy", "/terms", "/delete-account"]) {
    const response = await request.get(route, { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/html");
    expect(response.headers()["location"]).toBeUndefined();
    expect(await response.text()).not.toContain("Vercel Security Checkpoint");
    expect((await request.head(route, { maxRedirects: 0 })).status()).toBe(200);
  }
});

test("account deletion instructions are reachable from privacy without signing in", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/privacy");
  await page.getByRole("link", { name: "Account en gegevens laten verwijderen" }).click();
  await expect(page).toHaveURL(/\/delete-account$/);
  await expect(page.getByRole("heading", { name: "Delete your account", exact: true })).toBeVisible();
  const emailLink = page.getByRole("link", { name: "Request account deletion" });
  await expect(emailLink).toHaveAttribute("href", /^mailto:support@mymuscle\.app\?subject=/);
  await expect(page.locator("main")).toContainText("We will verify ownership before deletion.");
  await expect(page.locator("main")).toContainText("Backup copies expire according to the applicable backup cycle.");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("link", { name: "Read the privacy notice" }).click();
  await expect(page.locator("main")).toContainText(notice.version);
});

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
