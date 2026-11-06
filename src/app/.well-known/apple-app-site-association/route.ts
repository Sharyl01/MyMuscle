export function GET() {
  return Response.json({ applinks: { details: [{ appIDs: ["3KX3R7T584.com.apphletes.mymuscle"], components: [{ "/": "/workout/*/download", exclude: true }, { "/": "/workout/*", comment: "Open shared MyMuscle programs" }, { "/": "/invite/*", comment: "Open MyMuscle invitations" }] }] } }, { headers: { "Cache-Control": "public, max-age=3600" } });
}
