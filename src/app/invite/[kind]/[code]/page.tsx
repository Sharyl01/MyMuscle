import type { Metadata } from "next";
import { notFound } from "next/navigation";
import InviteHandoff from "./invite-handoff";

export const metadata: Metadata = { title: "Uitnodiging | MyMuscle", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function InvitationPage({ params }: { params: Promise<{ kind: string; code: string }> }) {
  const { kind, code: routeCode } = await params;
  let code: string;
  try { code = decodeURIComponent(routeCode); } catch { notFound(); }
  const valid = kind === "group" ? /^[\p{L}\p{N} ._#&'()-]{4,100}$/u.test(code) && /[\p{L}\p{N}]/u.test(code)
    : kind === "friend" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(code);
  if (!valid) notFound();
  return <InviteHandoff kind={kind as "friend" | "group"} code={kind === "group" ? code.toUpperCase() : code.toLowerCase()} />;
}
