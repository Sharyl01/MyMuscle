import { NextRequest, NextResponse } from "next/server";
import { appDownloadDestination } from "@/lib/app-destinations";
export function GET(request: NextRequest) {
  return NextResponse.redirect(appDownloadDestination(request.headers.get("user-agent") ?? ""), { status: 302, headers: { "Cache-Control": "no-store", Vary: "User-Agent", "Referrer-Policy": "no-referrer" } });
}
