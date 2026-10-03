import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { jsPDF } from "https://esm.sh/jspdf@2.5.1"

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

    // Fetch Super Admin email
    const { data: adminData, error: adminError } = await supabaseClient
      .from('admin_users')
      .select('email')
      .eq('role', 'super_admin')
      .single()

    if (adminError || !adminData) {
      throw new Error('Super Admin not found')
    }

    const superAdminEmail = adminData.email

    // Fetch Performance Data for last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const startDate = sevenDaysAgo.toISOString()

    const [ticketsRes, repairsRes, engineersRes] = await Promise.all([
      supabaseClient.from('support_tickets').select('*').gte('created_at', startDate),
      supabaseClient.from('hardware_repairs').select('*').gte('created_at', startDate),
      supabaseClient.from('engineers').select('*')
    ])

    const tickets = ticketsRes.data || []
    const repairs = repairsRes.data || []
    const engineers = engineersRes.data || []

    // Calculations (Simplified for PDF)
    const totalRevenue = repairs.reduce((acc, r) => acc + (Number(r.total_price) || 0), 0)
    const totalCosts = repairs.reduce((acc, r) => acc + (Number(r.parts_cost) || 0) + (Number(r.labor_cost) || 0), 0)
    const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue * 100).toFixed(1) : 0

    // PDF Generation
    const doc = new jsPDF()
    doc.setFontSize(22)
    doc.setTextColor(30, 64, 175)
    doc.text('VedTech Services', 105, 20, { align: 'center' })
    doc.setFontSize(16)
    doc.text('Weekly Service Performance Report', 105, 30, { align: 'center' })
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(`Period: ${sevenDaysAgo.toLocaleDateString()} to ${new Date().toLocaleDateString()}`, 105, 38, { align: 'center' })

    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Financial Summary', 20, 50)
    doc.setFontSize(10)
    doc.text(`Total Revenue: INR ${totalRevenue.toLocaleString()}`, 25, 60)
    doc.text(`Total Costs: INR ${totalCosts.toLocaleString()}`, 25, 65)
    doc.text(`Gross Margin: ${grossMargin}%`, 25, 70)

    doc.setFontSize(14)
    doc.text('Support Summary', 20, 85)
    doc.setFontSize(10)
    doc.text(`New Tickets Raised: ${tickets.length}`, 25, 95)
    doc.text(`Hardware Repairs Initiated: ${repairs.length}`, 25, 100)

    const pdfBase64 = doc.output('datauristring').split(',')[1]

    // Send Email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not set')
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'VedTech Reports <reports@vedtechservices.in>', // Note: domain must be verified in Resend
        to: [superAdminEmail],
        subject: `Weekly Service Performance Report - ${new Date().toLocaleDateString()}`,
        html: `
          <h1>Weekly Performance Summary</h1>
          <p>Hello Super Admin,</p>
          <p>Please find attached the service performance report for the past 7 days.</p>
          <ul>
            <li><strong>Total Revenue:</strong> INR ${totalRevenue.toLocaleString()}</li>
            <li><strong>Gross Margin:</strong> ${grossMargin}%</li>
            <li><strong>New Tickets:</strong> ${tickets.length}</li>
          </ul>
          <p>Best Regards,<br/>VedTech Automation System</p>
        `,
        attachments: [
          {
            filename: `VedTech_Weekly_Report_${new Date().toISOString().split('T')[0]}.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    })

    const emailResult = await emailResponse.json()
    const deliveryStatus = emailResponse.ok ? 'Success' : 'Failed'
    const errorMessage = emailResponse.ok ? null : JSON.stringify(emailResult)

    // Log Activity and Specific Report Log
    await Promise.all([
      supabaseClient.from('activity_logs').insert({
        action_type: 'automated_report_sent',
        target_type: 'performance_report',
        details: { recipient: superAdminEmail, revenue: totalRevenue, status: deliveryStatus, error: errorMessage },
        actor_id: null, // System
      }),
      supabaseClient.from('report_delivery_logs').insert({
        report_type: 'weekly_performance',
        recipient_email: superAdminEmail,
        status: deliveryStatus,
        error_message: errorMessage
      })
    ])

    if (!emailResponse.ok) {
      throw new Error(`Email sending failed: ${errorMessage}`)
    }

    return new Response(JSON.stringify({ success: true, message: 'Report sent successfully' }), {
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
