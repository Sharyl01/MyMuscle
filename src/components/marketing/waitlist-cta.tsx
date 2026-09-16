import { WaitlistButton } from "@/components/landing/waitlist-button";
import s from "./marketing.module.css";

export function WaitlistCta() {
  return (
    <WaitlistButton
      variant="secondary"
      className={s.cta}
      dialogClassName={s.waitlistDialog}
    >
      Join Waitlist <span aria-hidden="true">↗</span>
    </WaitlistButton>
  );
}
