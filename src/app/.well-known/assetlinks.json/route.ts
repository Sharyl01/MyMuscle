import { androidFingerprints } from "@/lib/app-destinations";
export function GET() {
  const fingerprints = androidFingerprints();
  return Response.json(fingerprints.length ? [{ relation: ["delegate_permission/common.handle_all_urls"], target: { namespace: "android_app", package_name: "com.apphletes.mymuscle", sha256_cert_fingerprints: fingerprints } }] : [], { headers: { "Cache-Control": "public, max-age=3600" } });
}
