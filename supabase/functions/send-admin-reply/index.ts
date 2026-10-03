import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceRoleKey || req.headers.get('Authorization') !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const { customerEmail, subject, message, escalationId, adminName } = await req.json()

    if (!customerEmail || !message) {
      throw new Error('Customer email and message are required')
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not set')
    }

    // Send email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'VedTech Services <support@vedtechservices.in>',
        to: customerEmail,
        subject: subject || `Re: Your Support Request - ${escalationId?.slice(0, 8)}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #1e293b;">VedTech Services Support Reply</h2>
            <p>Dear Customer,</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              ${message}
            </div>
            <p>Regards,<br>${adminName || 'Admin'}<br>VedTech Services Team</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #64748b;">This is an official communication from VedTech Services.</p>
          </div>
        `,
      }),
    })

    const emailData = await emailRes.json()
    if (!emailRes.ok) {
      throw new Error(`Resend error: ${JSON.stringify(emailData)}`)
    }

    // Update escalation record if needed (log that email was sent)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    await supabase.from('activity_logs').insert({
      action_type: 'admin_email_reply',
      target_type: 'chatbot_escalations',
      target_id: escalationId,
      details: {
        recipient: customerEmail,
        subject: subject,
        admin_name: adminName,
        status: 'Sent'
      }
    })

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
