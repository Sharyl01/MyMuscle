import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return new Response(null, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const values = body && typeof body === "object" ? body : {};
  const sessionId = "sessionId" in values ? values.sessionId : null;
  const path = "path" in values ? values.path : null;

  if (
    typeof sessionId !== "string" ||
    !UUID_PATTERN.test(sessionId) ||
    path !== "/"
  ) {
    return new Response(null, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("website_visits")
    .insert({ session_id: sessionId, path });

  if (error) {
    console.error("Website visit could not be stored", {
      code: error.code,
      message: error.message,
    });
    return new Response(null, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
