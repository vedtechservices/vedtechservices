// Retired because its former public endpoint trusted caller-supplied admin IDs
// and roles while using the service-role key. CRM requests now use the signed
// Next.js admin session through /api/private-data.
Deno.serve((req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
  return new Response(JSON.stringify({ error: 'This function is retired. Use the authenticated application API.' }), {
    status: 410,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
});
