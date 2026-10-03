import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Customer {
  id: string;
  registration_date: string;
  status: string;
  created_at: string;
}

interface Ticket {
  customer_id: string;
  created_at: string;
}

interface EmailCampaign {
  open_rate: number;
  click_rate: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceRoleKey || req.headers.get('Authorization') !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch all customers
    const { data: customers, error: customersError } = await supabaseClient
      .from('customers')
      .select('id, registration_date, status, created_at');

    if (customersError) throw customersError;

    // Fetch tickets for frequency calculation
    const { data: tickets, error: ticketsError } = await supabaseClient
      .from('tickets')
      .select('customer_id, created_at')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    if (ticketsError) throw ticketsError;

    // Fetch email campaign metrics
    const { data: emailCampaigns, error: emailError } = await supabaseClient
      .from('email_campaigns')
      .select('open_rate, click_rate');

    if (emailError) throw emailError;

    const now = Date.now();
    const updatedCustomers: Array<{ id: string; engagement_score: number }> = [];

    for (const customer of (customers as Customer[] || [])) {
      let score = 0;

      // 1. Ticket Submission Frequency (0-20 points)
      const customerTickets = (tickets as Ticket[] || []).filter(t => t.customer_id === customer.id);
      const ticketFrequency = customerTickets.length;
      score += Math.min(ticketFrequency * 2, 20);

      // 2. AMC Renewal Frequency (0-20 points)
      if (customer.status === 'Active') {
        score += 20;
      } else {
        score += 5;
      }

      // 3. Service Purchase Frequency (0-15 points)
      // Simulated based on ticket count as proxy
      score += Math.min(ticketFrequency * 1.5, 15);

      // 4. Email Open/Click Rates (0-15 points)
      const avgOpenRate = (emailCampaigns as EmailCampaign[] || []).length > 0
        ? (emailCampaigns as EmailCampaign[]).reduce((sum, c) => sum + c.open_rate, 0) / (emailCampaigns as EmailCampaign[]).length
        : 0;
      const avgClickRate = (emailCampaigns as EmailCampaign[] || []).length > 0
        ? (emailCampaigns as EmailCampaign[]).reduce((sum, c) => sum + c.click_rate, 0) / (emailCampaigns as EmailCampaign[]).length
        : 0;
      score += (avgOpenRate * 10) + (avgClickRate * 5);

      // 5. Website Visit Frequency (0-15 points)
      // Simulated - in real app, track from analytics
      score += Math.random() * 15;

      // 6. Recency of Last Interaction (0-15 points)
      const daysSinceRegistration = (now - new Date(customer.registration_date).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceRegistration < 30) {
        score += 15;
      } else if (daysSinceRegistration < 90) {
        score += 10;
      } else if (daysSinceRegistration < 180) {
        score += 5;
      }

      // Normalize to 0-100
      const finalScore = Math.min(Math.round(score), 100);

      updatedCustomers.push({
        id: customer.id,
        engagement_score: finalScore
      });
    }

    // Batch update customers with engagement scores
    for (const update of updatedCustomers) {
      await supabaseClient
        .from('customers')
        .update({ engagement_score: update.engagement_score })
        .eq('id', update.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated engagement scores for ${updatedCustomers.length} customers`,
        updated_count: updatedCustomers.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error calculating engagement scores:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
