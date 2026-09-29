"use server";
import { sendWaitlistConfirmation } from "@/lib/email/waitlist";
import { submitWebsiteEvent } from "@/lib/security/website-ingress";
import type { WaitlistState } from "@/lib/waitlist/state";

export async function joinWaitlist(_state: WaitlistState, formData: FormData): Promise<WaitlistState> {
  const honeypot = formData.get("company");
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return { status: "success", message: "You’re on the list. We’ll be in touch before launch." };
  }
  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }
  let result: Awaited<ReturnType<typeof submitWebsiteEvent>>;
  try { result = await submitWebsiteEvent("waitlist", { email }); }
  catch { return { status: "error", message: "We couldn’t save your email just now. Please try again." }; }
  if (result.limited) return { status: "error", message: "Too many attempts. Please try again later." };
  if (result.invalid) return { status: "error", message: "Enter a valid email address." };
  if (!result.inserted) return { status: "success", message: "You’re on the list. We’ll be in touch before launch." };
  const sent = await sendWaitlistConfirmation(email);
  return { status: "success", message: sent ? "You’re on the list. Check your inbox for confirmation." : "You’re on the list. We’ll email you when MyMuscle is almost live." };
}
