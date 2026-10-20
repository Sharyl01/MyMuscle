// Public widget identifier. The secret belongs only in Supabase Auth settings.
export const TURNSTILE_SITE_KEY = "0x4AAAAAAFLQmevfT92Xi25x";
export const CAPTCHA_ERROR = "De beveiligingscontrole is niet gelukt. Probeer opnieuw.";

export function readCaptchaToken(formData: FormData): string | null {
  const token = formData.get("captchaToken");
  return typeof token === "string" && token.length > 0 && token.length <= 2048 ? token : null;
}
