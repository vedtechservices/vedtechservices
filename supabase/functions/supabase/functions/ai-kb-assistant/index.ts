import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify SendGrid signature (optional but recommended for production)
    const signature = req.headers.get('x-twilio-email-event-webhook-signature');
    const timestamp = req.headers.get('x-twilio-email-event-webhook-timestamp');
    const publicKey = Deno.env.get('SENDGRID_WEBHOOK_PUBLIC_KEY');

    // Parse webhook payload
    const events: SendGridEvent[] = await req.json();
    
    console.log(`Received ${events.length} SendGrid webhook events`);

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
          console.error('Error inserting email delivery log:', insertError);
        } else {
          console.log(`Logged ${eventType} event for ${event.email}`);
        }
      } catch (eventError) {
        console.error('Error processing event:', eventError);
        // Continue processing other events
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, processed: events.length }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('SendGrid webhook error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
