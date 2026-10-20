import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { appDownloadDestination, androidFingerprints } from "../src/lib/app-destinations";
const token = "11111111-1111-4111-8111-111111111111";
test("public link renders a limited premium preview, safe social metadata and locked sessions", async ({ page, request }) => {
  for (const width of [320, 390, 1100]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto(`/workout/${token}`);
    await expect(page.getByRole("heading", { name: "Upper / Lower Test" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Barbell Bench Press" })).toBeVisible();
    await expect(page.getByText("LOCKED", { exact: true })).toHaveCount(2);
    await expect(page.getByRole("img", { name: /Rest day/ })).toHaveCount(4);
    await expect(page.getByRole("link", { name: "Download MyMuscle" })).toHaveAttribute("href", "/download");
    expect(await page.locator("body").evaluate(el => el.scrollWidth > window.innerWidth)).toBe(false);
    if (width === 390) expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    if (width === 390) await page.screenshot({ path: "artifacts/workout-sharing-2026-10-19/public-preview-390.png", fullPage: true });
  }
  const response = await request.get(`/workout/${token}`, { headers: { "user-agent": "WhatsApp/2.23" } });
  const html = await response.text();
  expect(html).toContain('property="og:title"');
  expect(html).toContain('property="og:description"');
  expect(html).toContain("Upper / Lower · 3 days/week");
  for (const forbidden of ["HIDDEN_TITLE", "sourceName", "workout_external_full", "sender_id", "owner_id", "exerciseId"]) expect(html).not.toContain(forbidden);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["referrer-policy"]).toBe("no-referrer");
  const download = await request.get(`/workout/${token}/download`, { maxRedirects: 0, headers: { "user-agent": "iPhone" } });
  expect(download.status()).toBe(302); expect(download.headers().location).toBe("https://mymuscle.app/#waitlist");
});
test("invalid and revoked share links reveal nothing and association routes are public JSON", async ({ request }) => {
  for (const id of ["not-a-token", "22222222-2222-4222-8222-222222222222"]) {
    const response = await request.get(`/workout/${id}`);
    expect(response.status()).toBe(404); expect(await response.text()).not.toContain("Barbell Bench Press");
  }
  const apple = await request.get("/.well-known/apple-app-site-association");
  expect(apple.status()).toBe(200); expect(apple.headers()["content-type"]).toContain("application/json");
  expect(await apple.json()).toMatchObject({ applinks: { details: [{ appIDs: ["3KX3R7T584.com.apphletes.mymuscle"] }] } });
  const android = await request.get("/.well-known/assetlinks.json"); expect(android.status()).toBe(200); expect(await android.json()).toEqual([]);
});
test("only configured verified platform stores are selected; malformed destinations and certificates fail closed", () => {
  const original = { ios: process.env.MYMUSCLE_APP_STORE_URL, android: process.env.MYMUSCLE_GOOGLE_PLAY_URL, cert: process.env.MYMUSCLE_ANDROID_CERT_SHA256 };
  try {
    process.env.MYMUSCLE_APP_STORE_URL = "https://apps.apple.com/nl/app/mymuscle/id6815727446";
    process.env.MYMUSCLE_GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.apphletes.mymuscle";
    expect(appDownloadDestination("iPhone")).toBe(process.env.MYMUSCLE_APP_STORE_URL);
    expect(appDownloadDestination("Android")).toBe(process.env.MYMUSCLE_GOOGLE_PLAY_URL);
    process.env.MYMUSCLE_APP_STORE_URL = "javascript:alert(1)";
    expect(appDownloadDestination("iPhone")).toBe("https://mymuscle.app/#waitlist");
    process.env.MYMUSCLE_GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=someone.else";
    expect(appDownloadDestination("Android")).toBe("https://mymuscle.app/#waitlist");
    process.env.MYMUSCLE_ANDROID_CERT_SHA256 = "not-a-cert," + Array(32).fill("AB").join(":");
    expect(androidFingerprints()).toEqual([Array(32).fill("AB").join(":")]);
  } finally {
    for (const [key, value] of Object.entries({ MYMUSCLE_APP_STORE_URL: original.ios, MYMUSCLE_GOOGLE_PLAY_URL: original.android, MYMUSCLE_ANDROID_CERT_SHA256: original.cert })) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});
