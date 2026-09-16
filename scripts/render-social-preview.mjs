import { chromium } from "@playwright/test";

// Uses the original-model poster; no stock or generated product imagery.
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#101110;color:#f0eee8;font-family:Arial,sans-serif">
    <div style="position:relative;width:1200px;height:630px;overflow:hidden">
      <div style="position:absolute;left:72px;top:60px;font-size:25px;letter-spacing:-1px">MyMuscle</div>
      <div style="position:absolute;left:72px;top:205px;font-size:94px;letter-spacing:-6px;line-height:1;font-weight:500">See your<br><span style="color:#aaa99f">training.</span></div>
      <div style="position:absolute;left:76px;bottom:65px;font-size:18px;color:#b6b7af">Every muscle. Every workout. Visualized.</div>
      <img src="http://localhost:3000/marketing/model-poster.webp" style="position:absolute;right:120px;top:30px;height:580px;width:auto" alt="">
    </div></body></html>`);
  await page.locator("img").evaluate((image) => image.decode());
  await page.screenshot({ path: "public/marketing/social-preview.png" });
} finally {
  await browser.close();
}
