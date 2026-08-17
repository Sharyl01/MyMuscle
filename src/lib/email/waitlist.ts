import "server-only";

import { createHash } from "node:crypto";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendWaitlistConfirmation(email: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const idempotencyKey = createHash("sha256")
    .update(`mymuscle-waitlist:${email}`)
    .digest("hex");

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `waitlist-${idempotencyKey}`,
    },
    body: JSON.stringify({
      from:
        process.env.WAITLIST_FROM_EMAIL ??
        "MyMuscle <noreply@mymuscle.app>",
      to: [email],
      subject: "You’re on the MyMuscle waitlist",
      text: [
        "You’re on the MyMuscle waitlist.",
        "",
        "We’ll email you when the app is almost ready to launch, so you’ll be among the first to know.",
        "",
        "Keep training smart,",
        "MyMuscle",
        "",
        "Questions? Email support@mymuscle.app",
      ].join("\n"),
      html: `
        <div style="background:#050505;color:#e5eef8;font-family:Arial,sans-serif;padding:40px 20px">
          <div style="max-width:560px;margin:0 auto;border:1px solid #25303a;border-radius:18px;background:#101215;padding:36px">
            <div style="font-size:13px;font-weight:700;letter-spacing:2px;color:#6ee7b7;text-transform:uppercase">MyMuscle</div>
            <h1 style="font-size:30px;line-height:1.2;margin:18px 0;color:#fff">You’re on the waitlist.</h1>
            <p style="font-size:16px;line-height:1.7;color:#cbd5e1;margin:0 0 18px">Thanks for joining MyMuscle. We’ll email you when the app is almost ready to launch, so you’ll be among the first to know.</p>
            <p style="font-size:16px;line-height:1.7;color:#cbd5e1;margin:0">Keep training smart,<br><strong style="color:#fff">MyMuscle</strong></p>
            <p style="font-size:13px;line-height:1.6;color:#64748b;margin:30px 0 0">Questions? Email <a href="mailto:support@mymuscle.app" style="color:#7dd3fc">support@mymuscle.app</a>.</p>
          </div>
        </div>`,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Waitlist confirmation could not be sent", {
      status: response.status,
      detail: detail.slice(0, 500),
    });
    return false;
  }

  return true;
}
