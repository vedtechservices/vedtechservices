import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generatePreviewHtml(
  type: 'breached' | 'approaching',
  esc: { customer_name: string; message: string; priority: string; created_at: string },
  targetMin: number,
  integrationApiKey: string,
  customPromptBase?: string
): Promise<string> {
  const createdAt = new Date(esc.created_at).getTime();
  const now = Date.now();
  const elapsedMin = (now - createdAt) / (1000 * 60);

  const base = customPromptBase?.trim() ||
    `You are a professional IT support operations assistant for VedTech Services. Write a concise, professional HTML email body (no <html>/<head>/<body> tags — inner content only). Include a clear header, a data table of key facts, and a call-to-action. Use inline CSS. Keep it under 300 words.`;

  const prompt = type === 'breached'
    ? `${base}

Context — SLA BREACHED:
- Customer: ${esc.customer_name}
- Issue: "${esc.message}"
- Priority: ${esc.priority}
- Time elapsed: ${Math.round(elapsedMin)} minutes (target was ${targetMin} minutes)
- Breach by: ${Math.round(Math.max(0, elapsedMin - targetMin))} minutes
Use red accents for urgency.`
    : `${base}

Context — SLA APPROACHING:
- Customer: ${esc.customer_name}
- Issue: "${esc.message}"
- Priority: ${esc.priority}
- Time elapsed: ${Math.round(elapsedMin)} minutes (target: ${targetMin} minutes, ${Math.round(Math.max(0, targetMin - elapsedMin))} minutes remaining)
Use amber/orange accents.`;

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceRoleKey || req.headers.get('Authorization') !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const endpoint = `https://app-99gjdx4fbuv5-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Authorization': `Bearer ${integrationApiKey}`,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      }),
    });

    if (!response.ok) return buildFallback(type, esc, elapsedMin, targetMin);

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n')) {
        if (line.startsWith('data: ')) {
          const json = line.slice(6).trim();
          if (json === '[DONE]') continue;
          try {
            const parsed = JSON.parse(json);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) fullText += text;
          } catch { /* skip */ }
        }
      }
    }
    return fullText.trim() || buildFallback(type, esc, elapsedMin, targetMin);
  } catch {
    return buildFallback(type, esc, elapsedMin, targetMin);
  }
}

function buildFallback(
  type: 'breached' | 'approaching',
  esc: { customer_name: string; message: string; priority: string },
  elapsedMin: number,
  targetMin: number
): string {
  const color = type === 'breached' ? '#dc2626' : '#d97706';
  const label = type === 'breached' ? '🔴 SLA BREACHED' : '⚠️ SLA Approaching';
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2 style="color:${color};margin-bottom:16px;">${label}</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;width:140px;">Customer</td><td style="padding:8px;border:1px solid #e5e7eb;">${esc.customer_name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Priority</td><td style="padding:8px;border:1px solid #e5e7eb;">${esc.priority}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Issue</td><td style="padding:8px;border:1px solid #e5e7eb;">${esc.message}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Elapsed</td><td style="padding:8px;border:1px solid #e5e7eb;">${Math.round(elapsedMin)} min (target: ${targetMin} min)</td></tr>
      </table>
      <p style="color:${color};font-weight:bold;">Please respond immediately via the dashboard.</p>
    </div>
  `;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { escalationId, type, send = false, triggeredBy } = await req.json();
    if (!escalationId) throw new Error('escalationId is required');
    if (!['breached', 'approaching'].includes(type)) throw new Error('type must be "breached" or "approaching"');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const integrationApiKey = Deno.env.get('INTEGRATIONS_API_KEY') ?? '';

    // Fetch the escalation
    const { data: esc, error: escErr } = await supabase
      .from('chatbot_escalations')
      .select('id, customer_name, message, priority, created_at')
      .eq('id', escalationId)
      .maybeSingle();
    if (escErr || !esc) throw new Error('Escalation not found');

    // Fetch matching SLA setting
    const { data: sla } = await supabase
      .from('sla_settings')
      .select('first_response_target_min')
      .eq('priority', (esc as any).priority || 'Medium')
      .maybeSingle();
    const targetMin: number = (sla as any)?.first_response_target_min ?? 30;

    // Fetch custom prompt
    const { data: promptSetting } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'sla_email_prompt')
      .maybeSingle();
    const customPromptBase: string | undefined = (promptSetting as any)?.value || undefined;

    const html = await generatePreviewHtml(type, esc as any, targetMin, integrationApiKey, customPromptBase);

    // ── Optional: send to all active admins via Resend ──
    if (send) {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) throw new Error('RESEND_API_KEY not configured — cannot send email.');

      const { data: admins, error: adminErr } = await supabase
        .from('admin_users')
        .select('email, full_name')
        .eq('is_active', true);
      if (adminErr) throw adminErr;
      if (!admins || admins.length === 0) throw new Error('No active admins found to send email to.');

      const subject = (type as string) === 'breached'
        ? `🔴 SLA BREACHED: ${(esc as any).customer_name} — ${(esc as any).priority} Priority`
        : `⚠️ SLA Approaching: ${(esc as any).customer_name} — ${(esc as any).priority} Priority`;

      const dashboardUrl = `${Deno.env.get('APP_URL') || 'https://vedtechservices.in'}/admin/chat-escalations`;
      const fullHtml = `
        ${html}
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
        <p style="font-family:Arial,sans-serif;font-size:12px;color:#6b7280;">
          Sent manually from the SLA Email Preview. &nbsp;
          <a href="${dashboardUrl}" style="color:#2563eb;">Open Escalations Dashboard →</a>
        </p>
      `;

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'VedTech SLA Monitor <alerts@vedtechservices.in>',
          to: (admins as any[]).map((a) => a.email),
          subject,
          html: fullHtml,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        throw new Error(`Resend API error: ${errText}`);
      }

      const recipientCount = (admins as any[]).length;

      // ── Write to sla_email_send_log ──
      await supabase.from('sla_email_send_log').insert({
        escalation_id: escalationId,
        email_type: type,
        recipient_count: recipientCount,
        triggered_by: triggeredBy || null,
      });

      return new Response(JSON.stringify({ html, sent: true, recipients: recipientCount }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ html, sent: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
