// Retired misplaced legacy SendGrid handler. The verified implementation is
// supabase/functions/sendgrid-webhook; never deploy this as an AI endpoint.
Deno.serve((request: Request) => new Response(
  request.method === 'OPTIONS' ? null : JSON.stringify({ error: 'This misplaced legacy endpoint is retired.' }),
  { status: request.method === 'OPTIONS' ? 204 : 410, headers: { 'Content-Type': 'application/json' } },
));
