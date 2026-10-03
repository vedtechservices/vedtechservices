import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceRoleKey || req.headers.get('Authorization') !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY')
    if (!apiKey) {
      throw new Error('INTEGRATIONS_API_KEY is not set')
    }

    const baseCurrency = 'INR'
    const apiUrl = `https://app-99gjdx4fbuv5-api-w9Rbo8E7p2b9.gateway.appmedo.com/v6/8192723d20263507156f9754/latest/${baseCurrency}`

    const response = await fetch(apiUrl, {
      headers: {
        'X-Gateway-Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API Error: ${errorData['error-type'] || response.statusText}`)
    }

    const data = await response.json()
    if (data.result !== 'success') {
      throw new Error(`API Error: ${data['error-type']}`)
    }

    const { error } = await supabaseClient
      .from('exchange_rates')
      .upsert({
        base_currency: baseCurrency,
        rates: data.conversion_rates,
        last_updated: new Date().toISOString()
      }, { onConflict: 'base_currency' })

    if (error) throw error

    return new Response(JSON.stringify({ success: true, rates: data.conversion_rates }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
