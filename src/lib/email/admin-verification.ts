import "server-only";

import { createHash } from "node:crypto";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendAdminVerificationCode({
  email,
  code,
  challengeId,
}: {
  email: string;
  code: string;
  challengeId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Admin verification email skipped: RESEND_API_KEY is missing.");
    return false;
  }

  const idempotencyKey = createHash("sha256")
    .update(`mymuscle-admin-verification:${challengeId}`)
    .digest("hex");

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `admin-verification-${idempotencyKey}`,
      },
      body: JSON.stringify({
        from:
          process.env.ADMIN_2FA_FROM_EMAIL ??
          process.env.WAITLIST_FROM_EMAIL ??
          "MyMuscle <noreply@mymuscle.app>",
        to: [email],
        subject: "Je MyMuscle verificatiecode",
        text: [
          "Je verificatiecode voor het MyMuscle dashboard is:",
          "",
          code,
          "",
          "Deze code is 10 minuten geldig. Heb je niet geprobeerd in te loggen? Negeer deze e-mail en wijzig je wachtwoord.",
          "",
          "MyMuscle",
        ].join("\n"),
        html: `
          <div style="background:#050505;color:#e5eef8;font-family:Arial,sans-serif;padding:40px 20px">
            <div style="max-width:560px;margin:0 auto;border:1px solid #25303a;border-radius:18px;background:#101215;padding:36px">
              <div style="font-size:13px;font-weight:700;letter-spacing:2px;color:#6ee7b7;text-transform:uppercase">MyMuscle</div>
              <h1 style="font-size:28px;line-height:1.2;margin:18px 0;color:#fff">Bevestig je login</h1>
              <p style="font-size:16px;line-height:1.7;color:#cbd5e1;margin:0 0 22px">Vul deze code in op het MyMuscle dashboard:</p>
              <div style="border:1px solid #334155;border-radius:14px;background:#07090b;color:#fff;font-size:34px;font-weight:800;letter-spacing:8px;padding:20px;text-align:center">${code}</div>
              <p style="font-size:14px;line-height:1.7;color:#94a3b8;margin:22px 0 0">De code verloopt over 10 minuten. Heb je niet geprobeerd in te loggen? Negeer deze e-mail en wijzig je wachtwoord.</p>
            </div>
          </div>`,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Admin verification email could not be sent", {
        status: response.status,
        detail: detail.slice(0, 500),
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Admin verification email request failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
}
