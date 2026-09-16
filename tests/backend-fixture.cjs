// Only the isolated Playwright server loads this file. No real signups or emails.
if (process.env.MYMUSCLE_E2E !== "1")
  throw new Error("Backend fixture is test-only");
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = String(input instanceof Request ? input.url : input);
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
