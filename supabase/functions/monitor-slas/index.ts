import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── LLM helper: generate a professional SLA breach/approaching email via Gemini ──
async function generateSlaEmailBody(
  type: 'breached' | 'approaching',
  esc: { customer_name: string; message: string; priority: string },
  elapsedMin: number,
  targetMin: number,
  integrationApiKey: string,
  customPromptBase?: string
): Promise<string> {
  const base = customPromptBase?.trim() ||
    `You are a professional IT support operations assistant for VedTech Services. Write a concise, professional HTML email body (no <html>/<head>/<body> tags — inner content only). Include a clear header, a data table of key facts, and a call-to-action. Use inline CSS. Keep it under 300 words.`

  const prompt = type === 'breached'
    ? `${base}

Context — SLA BREACHED:
- Customer: ${esc.customer_name}
- Issue: "${esc.message}"
- Priority: ${esc.priority}
- Time elapsed: ${Math.round(elapsedMin)} minutes (target was ${targetMin} minutes)
- Breach by: ${Math.round(elapsedMin - targetMin)} minutes
Use red accents for urgency.`
    : `${base}

Context — SLA APPROACHING:
- Customer: ${esc.customer_name}
- Issue: "${esc.message}"
- Priority: ${esc.priority}
- Time elapsed: ${Math.round(elapsedMin)} minutes (target: ${targetMin} minutes, ${Math.round(targetMin - elapsedMin)} minutes remaining)
Use amber/orange accents.`

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceRoleKey || req.headers.get('Authorization') !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const apiKey = integrationApiKey
    const endpoint = `https://app-99gjdx4fbuv5-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      }),
    })

    if (!response.ok) return buildFallbackHtml(type, esc, elapsedMin, targetMin)

    // Parse SSE stream and concatenate all text chunks
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim()
          if (jsonStr === '[DONE]') continue
          try {
            const parsed = JSON.parse(jsonStr)
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) fullText += text
          } catch { /* skip malformed frames */ }
        }
      }
    }

    return fullText.trim() || buildFallbackHtml(type, esc, elapsedMin, targetMin)
  } catch {
    return buildFallbackHtml(type, esc, elapsedMin, targetMin)
  }
}

function buildFallbackHtml(
  type: 'breached' | 'approaching',
  esc: { customer_name: string; message: string; priority: string },
  elapsedMin: number,
  targetMin: number
): string {
  const color = type === 'breached' ? '#dc2626' : '#d97706'
  const label = type === 'breached' ? '🔴 SLA BREACHED' : '⚠️ SLA Approaching'
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h2 style="color:${color};margin-bottom:16px;">${label}</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;width:160px;">Customer</td><td style="padding:8px;border:1px solid #e5e7eb;">${esc.customer_name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Priority</td><td style="padding:8px;border:1px solid #e5e7eb;">${esc.priority}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Issue</td><td style="padding:8px;border:1px solid #e5e7eb;">${esc.message}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Elapsed</td><td style="padding:8px;border:1px solid #e5e7eb;">${Math.round(elapsedMin)} min (target: ${targetMin} min)</td></tr>
      </table>
      <p style="color:${color};font-weight:bold;">Please respond immediately via the dashboard.</p>
    </div>
  `
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const integrationApiKey = Deno.env.get('INTEGRATIONS_API_KEY') ?? ''

    // 0. Fetch custom SLA email prompt (if configured)
    const { data: settingRows } = await supabaseClient
      .from('admin_settings')
      .select('value')
      .eq('key', 'sla_email_prompt')
      .maybeSingle()
    const customPromptBase: string | undefined = (settingRows as any)?.value || undefined

    // 1. Fetch SLA settings
    const { data: slaSettings, error: slaError } = await supabaseClient
      .from('sla_settings')
      .select('*')
    
    if (slaError) throw slaError

    // 2. Fetch pending escalations
    const { data: escalations, error: escError } = await supabaseClient
      .from('chatbot_escalations')
      .select('*')
      .eq('status', 'pending')
      .is('first_response_at', null)

    if (escError) throw escError

    // 3. Fetch all admins for notification
    const { data: admins, error: adminError } = await supabaseClient
      .from('admin_users')
      .select('email, full_name')
      .eq('is_active', true)

    if (adminError) throw adminError

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) throw new Error('RESEND_API_KEY not set')

    const notificationsSent = []

    for (const esc of escalations) {
      const priority = esc.priority || 'Medium'
      const setting = slaSettings.find((s: any) => s.priority === priority)
      if (!setting) continue

      const createdAt = new Date(esc.created_at).getTime()
      const now = new Date().getTime()
      const elapsedMin = (now - createdAt) / (1000 * 60)
      const targetMin = setting.first_response_target_min

      let notificationType: 'approaching' | 'breached' | null = null

      // Breach check
      if (elapsedMin >= targetMin && !esc.sla_breach_notified_at) {
        notificationType = 'breached'
      } 
      // Approaching check (80% threshold)
      else if (elapsedMin >= targetMin * 0.8 && !esc.sla_approaching_notified_at) {
        notificationType = 'approaching'
      }

      if (notificationType) {
        const subject = notificationType === 'breached' 
          ? `🔴 SLA BREACHED: ${esc.customer_name} — ${priority} Priority` 
          : `⚠️ SLA Approaching: ${esc.customer_name} — ${priority} Priority`

        // Generate LLM-powered email body (falls back to static template if LLM fails)
        const htmlBody = await generateSlaEmailBody(
          notificationType,
          { customer_name: esc.customer_name, message: esc.message, priority },
          elapsedMin,
          targetMin,
          integrationApiKey,
          customPromptBase
        )

        const dashboardUrl = `${Deno.env.get('APP_URL') || 'https://vedtechservices.in'}/admin/chat-escalations`
        const fullHtml = `
          ${htmlBody}
          <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
          <p style="font-family:Arial,sans-serif;font-size:12px;color:#6b7280;">
            <a href="${dashboardUrl}" style="color:#2563eb;">Open Escalations Dashboard →</a>
          </p>
        `

        // Send to all active admins
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'VedTech SLA Monitor <alerts@vedtechservices.in>',
            to: admins.map((a: any) => a.email),
            subject: subject,
            html: fullHtml,
          }),
        })

        if (emailResponse.ok) {
          const updateData: any = {}
          if (notificationType === 'breached') {
            updateData.sla_breach_notified_at = new Date().toISOString()
            updateData.sla_status = 'SLA Breached'
          } else {
            updateData.sla_approaching_notified_at = new Date().toISOString()
            updateData.sla_status = 'Approaching SLA'
          }

          await supabaseClient
            .from('chatbot_escalations')
            .update(updateData)
            .eq('id', esc.id)
          
          notificationsSent.push({ id: esc.id, type: notificationType })
        }
      }
    }

    return new Response(JSON.stringify({ success: true, sent: notificationsSent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
