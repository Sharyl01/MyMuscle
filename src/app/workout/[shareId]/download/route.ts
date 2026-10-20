import { NextRequest, NextResponse } from "next/server";
import { appDownloadDestination } from "@/lib/app-destinations";
import { validShareId } from "@/lib/workout-preview";
export function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/")[2];
  if (!validShareId(id)) return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(appDownloadDestination(request.headers.get("user-agent") ?? ""), { status: 302, headers: { "Cache-Control": "no-store", Vary: "User-Agent", "Referrer-Policy": "no-referrer" } });
}
