import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Delete your account",
  description: "Request deletion of your MyMuscle account and associated data, including without the app.",
  alternates: { canonical: "/delete-account" },
};
const deletionEmail = "mailto:support@mymuscle.app?subject=" + encodeURIComponent("MyMuscle account deletion request") + "&body=" + encodeURIComponent("Hello MyMuscle,\n\nPlease delete my MyMuscle account and associated data.\nMy account email address is: \n\nPlease confirm receipt and completion.\n");

export default function DeleteAccountPage() {
  return <main className="mx-auto min-h-svh max-w-2xl px-6 py-16 text-slate-100 sm:py-24">
    <Link href="/" className="text-sm text-slate-400 underline underline-offset-4">MyMuscle</Link>
    <p className="mt-12 text-xs uppercase tracking-[0.2em] text-emerald-200/70">Your account. Your choice.</p>
    <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Delete your account</h1>
    <p className="mt-6 leading-7 text-slate-300">Request deletion of your MyMuscle account and associated data. You can do this here even if you no longer have the app installed.</p>
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
      <h2 className="text-xl font-semibold">Request by email</h2>
      <p className="mt-3 leading-7 text-slate-300">Email us from the address linked to your MyMuscle account when possible. If you used Apple’s Hide My Email, mention your MyMuscle account address. We will verify ownership before deletion. Never send your password, login link or an identity document.</p>
      <a href={deletionEmail} style={{ color: "#14231b" }} className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[#dbe7dd] px-6 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300">Request account deletion ↗</a>
      <p className="mt-4 text-sm leading-6 text-slate-400">No email app? Send your request to <a className="underline underline-offset-4" href="mailto:support@mymuscle.app">support@mymuscle.app</a> with the subject “MyMuscle account deletion”.</p>
    </section>
    <section className="mt-10 space-y-4 leading-7 text-slate-300">
      <h2 className="text-xl font-semibold text-white">What happens next</h2>
      <p>We verify the request and confirm when deletion is complete. We normally respond within one month; if a lawful extension is needed, we explain it. Clicking the email button alone does not delete your account.</p>
      <p>Deletion covers your account, profile, stored avatars, workouts, personal records, plans, presets, bodyweight history, social relationships and associated direct messages in the active service. Groups with other active members receive a new host; empty groups are removed.</p>
      <p>Limited information may need to be retained for handling abuse reports, legal obligations or claims. Backup copies expire according to the applicable backup cycle. Any applicable exception and retention period will be explained in our response.</p>
      <h2 className="pt-4 text-xl font-semibold text-white">From the app</h2>
      <p>In the updated app, open Profile → Account verwijderen (Delete account). Your device data is cleared after server confirmation. If the request fails, retry or use the email route above. Uninstalling the app alone does not delete your online account.</p>
      <Link href="/privacy" className="inline-block pt-3 text-emerald-200 underline underline-offset-4">Read the privacy notice</Link>
    </section>
  </main>;
}
