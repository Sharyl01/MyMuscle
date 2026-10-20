import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // Deterministic widget only in the isolated browser. Never contacts Cloudflare.
  await page.route("https://challenges.cloudflare.com/turnstile/v0/api.js**", route => route.fulfill({
    contentType: "application/javascript",
    body: `window.turnstile={render(selector,options){const b=document.createElement('button');b.textContent='Complete test challenge';b.onclick=()=>options.callback('fixture-'+new URL(location.href).searchParams.get('requestId'));document.querySelector(selector).appendChild(b)}};`,
  }));
});

test("login consumes a fresh challenge on every retry and forwards its token", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Gebruikersnaam", { exact: true }).fill("testadmin");
  await page.getByLabel("Wachtwoord", { exact: true }).fill("test-only-password");
  await page.getByRole("button", { name: "Open dashboard" }).click();
  const frame = page.locator('iframe[title="Beveiligingscontrole"]');
  await expect(frame).toBeVisible();
  const first = await frame.getAttribute("src");
  // A same-origin message sent by the wrong window must not finish the challenge.
  await page.evaluate(src => window.postMessage({ type: "mymuscle-captcha", token: "forged", requestId: new URL(src!, location.origin).searchParams.get("requestId") }, location.origin), first);
  await expect(frame).toBeVisible();
  await page.frameLocator('iframe[title="Beveiligingscontrole"]').getByRole("button", { name: "Complete test challenge" }).click();
  await expect(page.locator('form [role="alert"]')).toHaveText("Onjuiste gebruikersnaam of wachtwoord.");
  await expect(frame).toHaveCount(0);
  await page.getByRole("button", { name: "Open dashboard" }).click();
  await expect(frame).toBeVisible();
  expect(await frame.getAttribute("src")).not.toBe(first);
  await page.getByRole("button", { name: "Annuleren", exact: true }).click();
  await expect(frame).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open dashboard" })).toBeEnabled();
});

test("password recovery forwards a fresh token before requesting mail", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByRole("button", { name: "Wachtwoord vergeten?" }).click();
  await page.getByLabel("Gebruikersnaam", { exact: true }).fill("testadmin");
  await page.getByRole("button", { name: "Stuur resetmail" }).click();
  await page.frameLocator('iframe[title="Beveiligingscontrole"]').getByRole("button", { name: "Complete test challenge" }).click();
  await expect(page.getByRole("status")).toContainText("Als deze beheerder bestaat");
  await expect(page.locator('iframe[title="Beveiligingscontrole"]')).toHaveCount(0);
});

test("blocked widget script shows a retryable error and re-enables the form", async ({ page }) => {
  await page.route("https://challenges.cloudflare.com/turnstile/v0/api.js**", route => route.abort());
  await page.goto("/admin/login");
  await page.getByLabel("Gebruikersnaam", { exact: true }).fill("testadmin");
  await page.getByLabel("Wachtwoord", { exact: true }).fill("test-only-password");
  await page.getByRole("button", { name: "Open dashboard" }).click();
  await expect(page.locator('form [role="alert"]')).toHaveText("De beveiligingscontrole is niet gelukt. Probeer opnieuw.");
  await expect(page.getByRole("button", { name: "Open dashboard" })).toBeEnabled();
});
