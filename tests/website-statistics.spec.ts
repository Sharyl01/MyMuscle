import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const cookieName = "mymuscle_website_statistics";
const consent = "2026-10-20-yes";
const sessionName = "mymuscle_website_session";
const endpoint = "/api/analytics/website-visit";

test("no visit identifier or request before a choice; declining persists on reload", async ({ page }) => {
  let visits = 0;
  await page.route(`**${endpoint}`, route => { visits++; return route.fulfill({ status: 204 }); });
  await page.goto("/");
  const preferences = page.getByRole("region", { name: "Website statistics preferences" });
  await expect(preferences).toBeVisible();
  expect(await page.evaluate(key => sessionStorage.getItem(key), sessionName)).toBeNull();
  expect(visits).toBe(0);
  await preferences.getByRole("button", { name: "No statistics", exact: true }).click();
  await expect(preferences).toHaveCount(0);
  await page.reload();
  await expect(preferences).toHaveCount(0);
  expect(await page.evaluate(key => sessionStorage.getItem(key), sessionName)).toBeNull();
  expect(visits).toBe(0);
});

test("opting in sends one visit; withdrawing clears the identifier and stops later visits", async ({ page }) => {
  const visits: { sessionId: string; consent: string }[] = [];
  await page.route(`**${endpoint}`, route => { visits.push(route.request().postDataJSON()); return route.fulfill({ status: 204 }); });
  await page.goto("/");
  await page.getByRole("button", { name: "Allow statistics", exact: true }).click();
  await expect.poll(() => visits.length).toBe(1);
  expect(visits[0].consent).toBe(consent);
  expect(visits[0].sessionId).toMatch(/^[\da-f-]{36}$/);
  expect(await page.evaluate(key => sessionStorage.getItem(key), sessionName)).toBe(visits[0].sessionId);
  await page.reload();
  await expect.poll(() => visits.length).toBe(2);
  expect(visits[1].sessionId).toBe(visits[0].sessionId);
  await page.getByRole("button", { name: "Website statistics", exact: true }).click();
  await page.getByRole("button", { name: "No statistics", exact: true }).click();
  expect(await page.evaluate(key => sessionStorage.getItem(key), sessionName)).toBeNull();
  await page.reload();
  await expect(page.getByRole("region", { name: "Website statistics preferences" })).toHaveCount(0);
  expect(visits).toHaveLength(2);
});

test("server rejects missing, refused or stale consent and accepts a valid opted-in request", async ({ request }) => {
  const data = { sessionId: "11111111-1111-4111-8111-111111111111", path: "/", consent };
  for (const value of [undefined, "no", "old-yes"]) {
    const response = await request.post(endpoint, { data, headers: value ? { cookie: `${cookieName}=${value}` } : {} });
    expect(response.status()).toBe(403);
  }
  const headers = { cookie: `${cookieName}=${consent}` };
  expect((await request.post(endpoint, { data: { ...data, consent: undefined }, headers })).status()).toBe(400);
  expect((await request.post(endpoint, { data, headers: { ...headers, origin: "https://untrusted.invalid" } })).status()).toBe(403);
  expect((await request.post(endpoint, { data, headers })).status()).toBe(204);
});

test("statistics choices fit a small phone, remain accessible, and do not cover the website", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/");
  const panel = page.getByRole("region", { name: "Website statistics preferences" });
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toBeVisible();
  expect(await panel.evaluate(element => getComputedStyle(element).position)).toBe("static");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  for (const name of ["No statistics", "Allow statistics"]) {
    const box = await panel.getByRole("button", { name, exact: true }).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
  expect((await new AxeBuilder({ page }).include('section[aria-label="Website statistics preferences"]').analyze()).violations).toEqual([]);
  await page.screenshot({ path: ".vercel/security-statistics-mobile.png" });
});
