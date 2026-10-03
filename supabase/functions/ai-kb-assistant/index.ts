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
    const { action, payload } = await req.json()
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const callAI = async (prompt: string) => {
      const { data, error } = await supabaseClient.functions.invoke('chat-ai', {
        body: { message: prompt }
      })
      if (error) throw error
      return data.response
    }

    if (action === 'suggest-topics') {
      const { data: escalations } = await supabaseClient
        .from('chatbot_escalations')
        .select('message')
        .order('created_at', { ascending: false })
        .limit(30)
      
      const messages = (escalations?.map(e => e.message) || []).join('\n')

      const prompt = `Based on the following customer queries for an IT services company, identify 5 common topics that should be documented in a Knowledge Base. For each topic, provide a short title and a one-sentence summary.
      Queries:
      ${messages}
      
      Return ONLY a JSON array of objects with "title" and "summary" keys. Do not include markdown formatting or extra text.`

      const response = await callAI(prompt)
      // Clean potential markdown code blocks
      const cleanedResponse = response.replace(/```json|```/g, '').trim()
      return new Response(cleanedResponse, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'generate-article') {
      const { title, summary } = payload
      const prompt = `Generate a comprehensive Knowledge Base article for the topic: "${title}". 
      Summary of issue: ${summary}
      
      The article should include:
      1. A clear "Solution" or "Guide" section with step-by-step instructions.
      2. A "Pro Tips" section.
      3. Suggested "Category" (choose from: Hardware, Software, Networking, AMC, Billing, General).
      4. Suggested "Tags" (comma-separated).
      5. SEO Meta Description (max 160 chars).
      
      Return ONLY JSON with keys: title, content, excerpt, category, tags, metaDescription. Do not include markdown.`

      const response = await callAI(prompt)
      const cleanedResponse = response.replace(/```json|```/g, '').trim()
      return new Response(cleanedResponse, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (action === 'categorize') {
      const { text } = payload
      const prompt = `Categorize the following text into one of these categories: Hardware, Software, Networking, AMC, Billing, General.
      Text: "${text}"
      
      Return only the category name.`

      const response = await callAI(prompt)
      return new Response(JSON.stringify({ category: response.trim() }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
