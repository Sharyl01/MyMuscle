// Only the isolated Playwright server loads this file. No real signups or emails.
if (process.env.MYMUSCLE_E2E !== "1")
  throw new Error("Backend fixture is test-only");
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = String(input instanceof Request ? input.url : input);
  if (url.includes("/rest/v1/rpc/workout_public_preview_v1")) {
    const { share_id } = JSON.parse(init?.body || "{}");
    if (share_id !== "11111111-1111-4111-8111-111111111111") return Response.json(null);
    return Response.json({ version: 1, name: "Upper / Lower Test", split: "Upper / Lower", goal: "Strength", emphasis: ["chest", "shoulders"], frequency: 3,
      previewWorkouts: [{ day: 0, name: "Upper A", exercises: [{ name: "Barbell Bench Press", sets: [{ reps: 8, repMax: 12, effort: 2, restSeconds: 90 }] }] }], lockedDays: [2, 4], restDays: [1, 3, 5, 6], visibleSets: 1, hiddenSets: 2 });
  }
  if (url.includes("/rest/v1/rpc/website_submit_v1")) {
    const body = JSON.parse(init?.body || "{}");
    if (body.kind === "visit") return Response.json({ inserted: true });
    if (body.kind !== "waitlist") throw new Error("Unexpected test submission kind");
    const email = body.payload?.email;
    if (email === "failure@example.invalid") return Response.json({ message: "Fixture insert error" }, { status: 403 });
    if (email === "duplicate@example.invalid") return Response.json({ inserted: false });
    if (email !== "new@example.invalid") throw new Error("Unexpected test signup");
    return Response.json({ inserted: true });
  }
  if (process.env.MYMUSCLE_CAPTCHA_E2E === "1" && /supabase\.(co|in)\/auth\/v1\/(token|recover)/.test(url)) {
    const body = JSON.parse(init?.body || "{}");
    if (!body.gotrue_meta_security?.captcha_token?.startsWith("fixture-")) {
      return Response.json({ code: "captcha_failed", msg: "Missing test CAPTCHA" }, { status: 400 });
    }
    if (url.includes("/recover")) return Response.json({});
    return Response.json({ code: "invalid_credentials", msg: "Test-only rejected password" }, { status: 400 });
  }
  if (url.includes("/rest/v1/waitlist_signups")) {
    const payload = JSON.parse(init?.body || "{}");
    const email = payload.email;
    if (email === "failure@example.invalid")
      return Response.json(
        { code: "42501", message: "Fixture insert error" },
        { status: 403 },
      );
    if (email === "duplicate@example.invalid")
      return Response.json(
        { code: "23505", message: "Fixture duplicate" },
        { status: 409 },
      );
    if (email !== "new@example.invalid")
      throw new Error("Unexpected test signup");
    return new Response(null, { status: 201 });
  }
  if (url.startsWith("https://api.resend.com/"))
    return Response.json({ id: "test-only-no-email-sent" });
  if (/supabase\.(co|in)/.test(url))
    return Response.json(
      { message: "External backend disabled in UI tests" },
      { status: 403 },
    );
  return originalFetch(input, init);
};
