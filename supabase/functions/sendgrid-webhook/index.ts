import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createPublicKey, verify } from 'node:crypto';
import { Buffer } from 'node:buffer';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-twilio-email-event-webhook-signature, x-twilio-email-event-webhook-timestamp',
};

interface SendGridEvent {
  email: string;
  timestamp: number;
  event: string;
  sg_event_id: string;
  sg_message_id: string;
  campaign_id?: string;
  campaign_name?: string;
  url?: string;
  reason?: string;
  status?: string;
  response?: string;
  type?: string;
  [key: string]: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') return new Response(null, { status: 405 });
    const signature = req.headers.get('x-twilio-email-event-webhook-signature');
    const timestamp = req.headers.get('x-twilio-email-event-webhook-timestamp');
    const publicKey = Deno.env.get('SENDGRID_WEBHOOK_PUBLIC_KEY');
    if (!publicKey) return new Response(JSON.stringify({ error: 'Webhook signature verification is not configured.' }), { status: 503 });
    if (!signature || !timestamp || !/^\d{1,12}$/.test(timestamp)) return new Response(null, { status: 401 });
    // Verify timestamp + original bytes before parsing, as required by SendGrid.
    const raw = Buffer.from(await req.arrayBuffer());
    if (raw.length > 1024 * 1024) return new Response(null, { status: 413 });
    let valid = false;
    try {
      const key = createPublicKey({ key: Buffer.from(publicKey, 'base64'), format: 'der', type: 'spki' });
      valid = verify('sha256', Buffer.concat([Buffer.from(timestamp), raw]), key, Buffer.from(signature, 'base64'));
    } catch { /* Invalid configuration or signature must fail closed. */ }
    if (!valid) return new Response(null, { status: 401 });
    const events: SendGridEvent[] = JSON.parse(raw.toString('utf8'));
    if (!Array.isArray(events) || events.length > 1000 || events.some(event => !event || typeof event.email !== 'string' || typeof event.event !== 'string' || !Number.isFinite(event.timestamp))) {
      return new Response(JSON.stringify({ error: 'Invalid event batch.' }), { status: 400 });
    }
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log(`Received ${events.length} SendGrid webhook events`);

    let failed = 0;
    // Process each event
    for (const event of events) {
      try {
        // Extract email_id from sg_message_id or custom headers
        const emailId = event.sg_message_id || event.sg_event_id;
        
        // Determine campaign type from custom args or campaign name
        let campaignType = 'email_campaign';
        let reportName = null;
        
        if (event.campaign_name) {
          if (event.campaign_name.includes('Scheduled Report')) {
            campaignType = 'scheduled_report';
            reportName = event.campaign_name;
          }
        }

        // Map SendGrid event types to our system
        const eventType = event.event; // delivered, open, click, bounce, dropped, deferred, spam_report, unsubscribe

        // Prepare metadata
        const metadata: any = {
          sg_event_id: event.sg_event_id,
          sg_message_id: event.sg_message_id,
          user_agent: event.useragent,
          ip: event.ip,
        };

        // Add event-specific metadata
        if (event.url) metadata.url = event.url;
        if (event.reason) metadata.reason = event.reason;
        if (event.status) metadata.status = event.status;
        if (event.response) metadata.response = event.response;
        if (event.type) metadata.bounce_type = event.type;

        // Insert into email_delivery_logs
        const { error: insertError } = await supabaseClient
          .from('email_delivery_logs')
          .insert({
            email_id: emailId,
            recipient: event.email,
            event_type: eventType,
            campaign_type: campaignType,
            report_name: reportName,
            timestamp: new Date(event.timestamp * 1000).toISOString(),
            metadata: metadata,
          });

        if (insertError) {
          failed++;
          console.error('SendGrid event persistence failed.');
        } else {
          console.log('SendGrid event persisted.');
        }
      } catch (eventError) {
        failed++;
        console.error('SendGrid event processing failed.');
        // Continue processing other events
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: failed === 0, processed: events.length - failed, failed }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: failed ? 503 : 200,
      }
    );
  } catch (error: any) {
    console.error('SendGrid webhook processing failed.');
    
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed.' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
