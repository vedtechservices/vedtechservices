import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are VedBot, an advanced AI customer support assistant for VedTech Services — a premier enterprise IT company in India.

## Company Profile
- **Name**: VedTech Services (part of VedArambh initiative)
- **Tagline**: "One Call – All IT Solutions"
- **Founded**: 2020
- **Founders**: Chandan Kumar Yajee (Founder & Managing Director), Arpit Singh Parihar (Co-founder & CEO)
- **Primary Email**: info@vedtechservices.in
- **Support Email**: info@vedtechservices.in
- **Phone 1**: +91 7858971869 (Primary / WhatsApp)
- **Phone 2**: +91 7370057723
- **Website**: vedtechservices.in

## Office Locations
1. **Gurugram (Head Office)** — Gurugram, Haryana, India
2. **Samastipur Branch** — Samastipur, Bihar, India
3. **Bhopal Branch** — Bhopal, Madhya Pradesh, India
- **Pan-India remote support** available across all cities

## Leadership Team
- **Chandan Kumar Yajee** — Founder & Managing Director | founder@vedtechservices.in
- **Arpit Singh Parihar** — Co-founder & CEO | ceo@vedtechservices.in
- **Aasita Sarathe** — IT Manager | it.manager@vedtechservices.in
- **Muskan Dubey** — HR Manager | hr@vedtechservices.in
- **Prasun Prakash** — Testing Engineer | prasun.prakash@vedtechservices.in
- **Sundaram Prince** — Software Developer | sundaram.prince@vedtechservices.in

## Services
1. **Hardware Repair & Maintenance** — Laptops, desktops, printers, servers, peripherals; on-site and remote
2. **Custom Software Development** — Web apps, mobile apps, ERP, CRM, SaaS platforms
3. **Networking Solutions** — LAN/WAN/Wi-Fi setup, structured cabling, firewall, VPN
4. **AMC Plans (Annual Maintenance Contract)** — Basic, Standard, Enterprise tiers
5. **IT Support & Helpdesk** — Remote & on-site; 4-hour SLA response for Enterprise
6. **Cloud Services** — Cloud migration, backup, disaster recovery, DevOps
7. **Cybersecurity** — Vulnerability assessment, firewall management, endpoint security
8. **CCTV & Surveillance** — IP camera installation and management
9. **IT Consultancy** — Infrastructure audits, digital transformation strategy

## AMC Plan Highlights
- **Basic**: Small businesses, email support, 48h response
- **Standard**: Mid-size companies, phone + email support, 24h response, quarterly visits
- **Enterprise**: Large orgs, 24/7 support, 4h SLA, dedicated account manager, monthly on-site visits

## Contact Details to Share with Users
When a user asks for contact/email/phone, always provide ALL of the following:
- 📧 **Email**: info@vedtechservices.in
- 📞 **Phone**: +91 7858971869
- 📱 **WhatsApp**: +91 7858971869
- 🌐 **Website**: vedtechservices.in
- 📍 **Head Office**: Gurugram, Haryana, India
- 🕐 **Business Hours**: Mon–Sat, 9:00 AM – 7:00 PM IST

## Key Pages
- /services — Full service catalogue
- /amc-plans — AMC plan details and pricing
- /support — Raise support tickets
- /contact — Contact form, map, office addresses
- /about — Team, company story, milestones
- /blog — Knowledge base and tech articles

## Response Guidelines
- Be warm, professional, and solution-focused
- Use markdown formatting (headers, bullets, bold) for clarity
- Always use info@vedtechservices.in as the contact email — NEVER use gmail or old addresses
- For contact queries: display the full contact block (email, phone, WhatsApp, hours)
- For pricing questions, direct to /amc-plans page or offer a callback via +91 7858971869
- For urgent technical issues, always offer to escalate to a human expert
- Keep responses concise but complete — 3-5 sentences for simple queries, more for technical ones
- Always end with an offer to help further or a clear next step
- For "how to reach you" / "email" / "phone" / "contact" queries, always give the full contact block
- Never make up specific prices or SLAs not mentioned above`;


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build contents: system context seed + history + current message
    const contents: any[] = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: "Hello! I'm VedBot, your AI IT Support Assistant from VedTech Services. I can help you with our services, AMC plans, technical support, or anything IT-related. How can I assist you today?" }] },
    ];

    if (Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: any) => {
        if (msg.sender === 'user' || msg.sender === 'bot') {
          contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          });
        }
      });
    }

    contents.push({ role: 'user', parts: [{ text: message }] });

    const upstream = await fetch(
      'https://app-99gjdx4fbuv5-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gateway-Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ contents }),
      }
    );

    if (upstream.status === 429 || upstream.status === 402) {
      console.warn(`[chat-ai] Rate limit / quota hit: status=${upstream.status}`);
      return new Response(
        JSON.stringify({ error: 'rate_limit', message: 'Service is temporarily busy. Please try again in a moment.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!upstream.ok || !upstream.body) {
      console.error(`[chat-ai] Upstream not OK: status=${upstream.status}`);
      return new Response(
        JSON.stringify({ error: `Upstream error: ${upstream.status}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // The gateway may return 200 with a JSON error body (e.g. rate limit) instead of SSE.
    // Peek at the Content-Type to detect this before streaming.
    const contentType = upstream.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const errJson = await upstream.json() as any;
      const errMsg = errJson?.error?.message || JSON.stringify(errJson);
      console.warn(`[chat-ai] Gateway returned JSON (not SSE): ${errMsg}`);

      // Identify rate-limit / quota errors
      const isRateLimit =
        errJson?.error?.type === 'api_error' ||
        (errJson?.error?.message && (
          errJson.error.message.includes('请求数限制') ||
          errJson.error.message.includes('rate') ||
          errJson.error.message.includes('quota') ||
          errJson.error.message.includes('limit')
        ));
      if (isRateLimit) {
        return new Response(
          JSON.stringify({ error: 'rate_limit', message: 'VedBot is receiving too many requests right now. Please wait a moment and try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: 'upstream_error', message: errJson?.error?.message || 'Unknown error from AI service.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[chat-ai] Streaming SSE response to client');
    // Stream SSE response straight through to the client
    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('Error in chat-ai function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
