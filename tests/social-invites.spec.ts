import { test, expect } from "@playwright/test";
import { ANDROID_PLAY_SIGNING_CERTIFICATE } from "../src/lib/app-destinations";
import { inviteDestination, startInviteHandoff } from "../src/lib/invite-handoff";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "../src/lib/app-links";

function browserFixture() {
  const navigation: string[] = [], timers = new Map<number, () => void>();
  const windowEvents = new EventTarget(), documentEvents = new EventTarget();
  let visibility = "visible", nextTimer = 0;
  const browser = {
    document: documentEvents,
    location: { replace: (url: string) => { navigation.push(url); } },
    setTimeout: (callback: () => void) => { timers.set(++nextTimer, callback); return nextTimer; },
    clearTimeout: (id: number) => { timers.delete(id); },
    addEventListener: windowEvents.addEventListener.bind(windowEvents),
    removeEventListener: windowEvents.removeEventListener.bind(windowEvents),
  } as unknown as Window;
  Object.defineProperty(browser.document, "visibilityState", { get: () => visibility });
  return { browser, navigation, timers,
    hide: () => { visibility = "hidden"; documentEvents.dispatchEvent(new Event("visibilitychange")); },
    show: () => { visibility = "visible"; documentEvents.dispatchEvent(new Event("visibilitychange")); },
    pagehide: () => windowEvents.dispatchEvent(new Event("pagehide")),
    finish: () => { const pending = [...timers.values()]; timers.clear(); pending.forEach(callback => callback()); },
  };
}

test("mobile destinations preserve the group and select the correct store, including desktop-mode iPads", () => {
  for (const [userAgent, touches, store] of [["iPhone", 1, APP_STORE_URL], ["iPad", 5, APP_STORE_URL], ["Macintosh", 5, APP_STORE_URL], ["Android", 1, GOOGLE_PLAY_URL]] as const) {
    const destination = inviteDestination("group", "TEAM PUSH #0042", userAgent, touches);
    expect(destination.storeUrl).toBe(store);
    expect(destination.appUrl).toContain("invite/group/TEAM%20PUSH%20%230042");
    if (userAgent === "Android") {
      expect(destination.appUrl).toContain("package=com.apphletes.mymuscle");
      expect(destination.appUrl).toContain(`S.browser_fallback_url=${encodeURIComponent(GOOGLE_PLAY_URL)}`);
    }
  }
  expect(inviteDestination("group", "ABCD1234", "Windows NT").storeUrl).toBeNull();
  expect(inviteDestination("group", "ABCD1234", "Macintosh", 0).storeUrl).toBeNull();
});

test("tries the group in the app first and then its store when the app does not open", () => {
  for (const platform of ["iPhone", "Android"]) {
    const fixture = browserFixture(), destination = inviteDestination("group", "ABCD1234", platform);
    startInviteHandoff(destination, fixture.browser);
    expect(fixture.navigation).toEqual([destination.appUrl]);
    fixture.finish();
    expect(fixture.navigation).toEqual([destination.appUrl, destination.storeUrl]);
  }
});

test("cancels store navigation after a successful app handoff and when returning to the browser", () => {
  for (const event of ["visibilitychange", "pagehide"] as const) {
    const fixture = browserFixture(), destination = inviteDestination("group", "ABCD1234", "iPhone");
    startInviteHandoff(destination, fixture.browser);
    if (event === "visibilitychange") fixture.hide(); else fixture.pagehide();
    fixture.show(); fixture.finish();
    expect(fixture.navigation).toEqual([destination.appUrl]);
    expect(fixture.timers.size).toBe(0);
  }
});

test("cancels an abandoned attempt and handles a browser rejecting the native scheme", () => {
  const fixture = browserFixture(), destination = inviteDestination("group", "ABCD1234", "iPhone");
  const stop = startInviteHandoff(destination, fixture.browser);
  stop(); fixture.finish();
  expect(fixture.navigation).toEqual([destination.appUrl]);
  fixture.browser.location.replace = url => {
    if (url.startsWith("musclefront:")) throw new Error("App is unavailable");
    fixture.navigation.push(url);
  };
  startInviteHandoff(destination, fixture.browser);
  expect(fixture.navigation.at(-1)).toBe(APP_STORE_URL);
  expect(fixture.timers.size).toBe(0);
});

test("shared group links show the app handoff and preserve the exact group code", async ({ page }) => {
  for (const code of ["ABCD1234", "TEAM PUSH #0042"]) {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 850 });
      const response = await page.goto(`/invite/group/${encodeURIComponent(code)}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { name: "Train mee in de groep" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Open MyMuscle" })).toHaveAttribute("href", `musclefront://invite/group/${encodeURIComponent(code)}`);
      await expect(page.getByText(code, { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "App Store", exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: "Google Play", exact: true })).toBeVisible();
      expect(await page.locator("body").evaluate(body => body.scrollWidth > window.innerWidth)).toBe(false);
    }
  }
});

test("friend links and domain associations target the app; invalid invitation routes fail closed", async ({ page, request }) => {
  const id = "99999999-9999-4999-8999-999999999999";
  await page.goto(`/invite/friend/${id}`);
  await expect(page.getByRole("link", { name: "Open MyMuscle" })).toHaveAttribute("href", `musclefront://invite/friend/${id}`);
  for (const path of ["/invite/friend/not-a-uuid", "/invite/admin/ABCD1234", "/invite/group/ABC"]) {
    expect((await request.get(path)).status()).toBe(404);
  }
  const apple = await request.get("/.well-known/apple-app-site-association");
  expect(apple.status()).toBe(200);
  expect((await apple.json()).applinks.details[0].components).toContainEqual({ "/": "/invite/*", comment: "Open MyMuscle invitations" });
  const android = await request.get("/.well-known/assetlinks.json");
  expect(android.status()).toBe(200);
  expect((await android.json())[0].target).toEqual({ namespace: "android_app", package_name: "com.apphletes.mymuscle", sha256_cert_fingerprints: [ANDROID_PLAY_SIGNING_CERTIFICATE] });
});

for (const [platform, storeUrl] of [["iPhone", APP_STORE_URL], ["Android", GOOGLE_PLAY_URL]] as const) {
  test(`${platform} automatically opens its store when the app is unavailable`, async ({ browser }) => {
    const context = await browser.newContext({ userAgent: platform, viewport: { width: 390, height: 850 } });
    try {
      const page = await context.newPage();
      await page.route(storeUrl + "*", route => route.fulfill({ contentType: "text/html", body: "<h1>App store test destination</h1>" }));
      await page.goto("http://localhost:3100/invite/group/ABCD1234");
      // An unavailable native protocol emits an aborted navigation in Chromium.
      // Poll the final URL while the store fallback timer finishes.
      await expect(page).toHaveURL(storeUrl, { timeout: 10000 });
      await expect(page.getByRole("heading", { name: "App store test destination" })).toBeVisible();
    } finally { await context.close(); }
  });
}
