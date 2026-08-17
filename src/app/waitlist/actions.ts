"use server";

import { sendWaitlistConfirmation } from "@/lib/email/waitlist";
import { createClient } from "@/lib/supabase/server";
import type { WaitlistState } from "@/lib/waitlist/state";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function joinWaitlist(
  _state: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const honeypot = formData.get("company");
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return {
      status: "success",
      message: "You’re on the list. We’ll be in touch before launch.",
    };
  }

  const rawEmail = formData.get("email");
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";

  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return {
      status: "error",
      message: "Enter a valid email address.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist_signups").insert({ email });

  if (error?.code === "23505") {
    return {
      status: "success",
      message:
        "This email is already on the waitlist. If you missed our confirmation, check your spam folder.",
    };
  }

  if (error) {
    console.error("Waitlist signup could not be stored", {
      code: error.code,
      message: error.message,
    });
    return {
      status: "error",
      message: "We couldn’t save your email just now. Please try again.",
    };
  }

  const confirmationSent = await sendWaitlistConfirmation(email);
  return {
    status: "success",
    message: confirmationSent
      ? "You’re on the list. Check your inbox for confirmation — and your spam folder if it’s not there."
      : "You’re on the list. We’ll email you when MyMuscle is almost live.",
  };
}
