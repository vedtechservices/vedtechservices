import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportSchedule {
  id: string;
  report_name: string;
  report_type: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  day_of_week?: string;
  day_of_month?: number;
  time_of_day: string;
  export_format: 'PDF' | 'Excel' | 'Both';
  email_recipients: string[];
  email_subject: string;
  email_body?: string;
  date_range: string;
  is_active: boolean;
  next_run_at: string | null;
  custom_date_range?: any;
  recipients_config?: any[];
  conditions?: any[];
  report_types?: string[];
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

    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
    if (!sendgridApiKey) {
      console.warn('SENDGRID_API_KEY not configured. Email sending will be simulated.');
    }

    // Fetch email template settings
    const { data: templateSettings } = await supabaseClient
      .from('email_template_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    const now = new Date();

    // Fetch all active scheduled reports that are due
    const { data: schedules, error: schedulesError } = await supabaseClient
      .from('report_schedules')
      .select('*')
      .eq('is_active', true)
      .lte('next_run_at', now.toISOString());

    if (schedulesError) throw schedulesError;

    const reportSchedules = schedules as ReportSchedule[] || [];
    const generatedReports: string[] = [];
    const errors: string[] = [];

    for (const schedule of reportSchedules) {
      try {
        // Fetch report data based on report_type
        let reportData: any = {};

        if (schedule.report_type === 'customer_growth') {
          const { data: customers } = await supabaseClient
            .from('customers')
            .select('*');
          reportData = { customers, type: 'Customer Growth Report' };
        } else if (schedule.report_type === 'retention_churn') {
          const { data: customers } = await supabaseClient
            .from('customers')
            .select('*');
          reportData = { customers, type: 'Retention & Churn Report' };
        } else if (schedule.report_type === 'satisfaction') {
          const { data: feedback } = await supabaseClient
            .from('customer_feedback')
            .select('*');
          reportData = { feedback, type: 'Customer Satisfaction Report' };
        } else if (schedule.report_type === 'amc_subscriptions') {
          const { data: customers } = await supabaseClient
            .from('customers')
            .select('*')
            .eq('status', 'Active');
          reportData = { customers, type: 'AMC Subscriptions Report' };
        }

        // Generate report content (CSV format)
        const reportContent = generateReportContent(reportData, schedule);

        // Send email with report
        if (sendgridApiKey) {
          await sendReportEmailViaSendGrid(schedule, reportContent, sendgridApiKey, templateSettings, supabaseClient);
        } else {
          // Fallback to simulation
          console.log('Simulating email send to:', schedule.email_recipients);
          console.log('Subject:', schedule.email_subject);
        }

        generatedReports.push(schedule.report_name);

        // Calculate next run time
        const nextRunAt = calculateNextRunTime(schedule, now);

        // Update schedule with next run time
        await supabaseClient
          .from('report_schedules')
          .update({ next_run_at: nextRunAt.toISOString() })
          .eq('id', schedule.id);

      } catch (error) {
        console.error(`Error generating report ${schedule.report_name}:`, error);
        errors.push(`${schedule.report_name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${generatedReports.length} reports`,
        reports: generatedReports,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating scheduled reports:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function generateReportContent(data: any, schedule: ReportSchedule): string {
  // Generate CSV content based on report type
  let content = `${data.type}\nGenerated: ${new Date().toISOString()}\n\n`;

  if (data.customers) {
    content += 'Customer Name,Email,Status,Lifetime Value,Registration Date\n';
    for (const customer of data.customers) {
      content += `${customer.name},${customer.email || 'N/A'},${customer.status},${customer.lifetime_value},${customer.registration_date}\n`;
    }
  } else if (data.feedback) {
    content += 'Customer ID,Rating,Feedback Type,Sentiment,Created At\n';
    for (const fb of data.feedback) {
      content += `${fb.customer_id || 'N/A'},${fb.rating || 'N/A'},${fb.feedback_type},${fb.sentiment || 'N/A'},${fb.created_at}\n`;
    }
  }

  return content;
}

function generateHTMLEmailTemplate(schedule: ReportSchedule, reportSummary: any, templateSettings?: any): string {
  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Use custom template settings or fallback to defaults
  const primaryColor = templateSettings?.primary_color || '#0a1f44';
  const secondaryColor = templateSettings?.secondary_color || '#1e3a8a';
  const accentColor = templateSettings?.accent_color || '#3b82f6';
  const companyName = templateSettings?.company_name || 'VED TECH SERVICES';
  const companyTagline = templateSettings?.company_tagline || 'Digital Solutions | Endless Possibilities';
  const companyAddress = templateSettings?.company_address || 'Samastipur, Bihar, India';
  const companyPhone = templateSettings?.company_phone || '+91 7858971869';
  const companyEmail = templateSettings?.company_email || 'info@vedtechservices.in ';
  const companyWebsite = templateSettings?.company_website || 'https://vedtechservices.in';
  const logoUrl = templateSettings?.logo_url;
  const footerContent = templateSettings?.footer_content;
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${schedule.report_name}</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${accentColor} 100%); padding: 40px 20px; text-align: center; }
    .logo { width: 60px; height: 60px; margin: 0 auto 15px; }
    .logo-text { color: #ffffff; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .tagline { color: rgba(255, 255, 255, 0.9); font-size: 14px; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #1f2937; margin-bottom: 20px; }
    .summary-section { background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .summary-title { font-size: 16px; font-weight: bold; color: ${primaryColor}; margin-bottom: 15px; }
    .metric-card { background-color: #ffffff; border-left: 4px solid ${accentColor}; padding: 15px; margin-bottom: 12px; border-radius: 4px; }
    .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .metric-value { font-size: 24px; font-weight: bold; color: ${primaryColor}; margin-top: 5px; }
    .cta-button { display: inline-block; background-color: ${accentColor}; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .cta-button:hover { background-color: ${secondaryColor}; }
    .footer { background-color: #1f2937; color: #9ca3af; padding: 30px 20px; text-align: center; font-size: 12px; }
    .footer-links { margin-top: 15px; }
    .footer-links a { color: ${accentColor}; text-decoration: none; margin: 0 10px; }
    .divider { height: 1px; background-color: #e5e7eb; margin: 25px 0; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" class="logo" style="width: 60px; height: 60px; margin: 0 auto 15px; display: block;">` : `<div class="logo-text">${companyName}</div>`}
      <div class="tagline">${companyTagline}</div>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">Hello,</div>
      <p style="color: #4b5563; line-height: 1.6;">
        Your scheduled <strong>${schedule.report_name}</strong> for <strong>${reportDate}</strong> is ready. 
        Below is a summary of key metrics from this report.
      </p>

      <!-- Summary Section -->
      <div class="summary-section">
        <div class="summary-title">📊 Report Summary</div>
        
        <div class="metric-card">
          <div class="metric-label">Total Records</div>
          <div class="metric-value">${reportSummary.totalRecords || 0}</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Report Type</div>
          <div class="metric-value" style="font-size: 18px;">${reportSummary.reportType || schedule.report_type}</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Date Range</div>
          <div class="metric-value" style="font-size: 18px;">${schedule.date_range}</div>
        </div>
      </div>

      <p style="color: #4b5563; line-height: 1.6;">
        The complete report data is attached as a CSV file. For a detailed analysis and interactive visualizations, 
        please access the full report in your CRM dashboard.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="${companyWebsite}/admin/crm/reports" class="cta-button">
          View Full Report in Dashboard →
        </a>
      </div>

      <div class="divider"></div>

      <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
        <strong>Note:</strong> This is an automated report generated by ${companyName} CRM system. 
        The attached CSV file contains the complete dataset for your analysis.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      ${footerContent ? `<div style="margin-bottom: 15px; line-height: 1.6;">${footerContent}</div>` : ''}
      <div style="margin-bottom: 15px;">
        <strong style="color: #ffffff;">${companyName}</strong><br>
        ${companyAddress}<br>
        Phone: ${companyPhone} | Email: ${companyEmail}
      </div>
      <div class="footer-links">
        <a href="https://vedtechservices.in">Website</a> |
        <a href="mailto:info@vedtechservices.in ">Email</a> |
        <a href="tel:+917858971869">Phone</a>
      </div>
      <div style="margin-top: 20px; color: #6b7280;">
        TECHNOLOGY | TRADITION | TRANSFORMATION<br>
        वसुधैव कुटुम्बकम्
      </div>
      <div style="margin-top: 15px; font-size: 11px;">
        © ${new Date().getFullYear()} VedTech Services. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

async function sendReportEmailViaSendGrid(
  schedule: ReportSchedule,
  reportContent: string,
  apiKey: string,
  templateSettings?: any,
  supabaseClient?: any
) {
  // Generate unique email ID for tracking
  const emailId = `${schedule.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Encode CSV content as base64 for attachment
  const encoder = new TextEncoder();
  const data = encoder.encode(reportContent);
  const base64Content = btoa(String.fromCharCode(...data));

  // Calculate report summary metrics
  const lines = reportContent.split('\n');
  const reportSummary = {
    totalRecords: Math.max(0, lines.length - 4), // Subtract header lines
    reportType: schedule.report_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  };

  // Generate HTML email template with custom settings
  const htmlContent = generateHTMLEmailTemplate(schedule, reportSummary, templateSettings);

  // Prepare recipients (support both old format and new recipients_config)
  let recipients = schedule.email_recipients || [];
  if (schedule.recipients_config && Array.isArray(schedule.recipients_config)) {
    recipients = schedule.recipients_config.map((r: any) => r.email);
  }

  const emailData = {
    personalizations: [
      {
        to: recipients.map((email: string) => ({ email: email.trim() })),
        subject: schedule.email_subject,
        custom_args: {
          email_id: emailId,
          campaign_type: 'scheduled_report',
          report_name: schedule.report_name
        }
      }
    ],
    from: {
      email: 'info@vedtechservices.in ',
      name: 'VedTech Services Reports'
    },
    content: [
      {
        type: 'text/html',
        value: htmlContent
      },
      {
        type: 'text/plain',
        value: schedule.email_body || `Please find attached your scheduled ${schedule.report_name}.\n\nThis is an automated report generated by VedTech Services CRM system.\n\nView full report: https://vedtechservices.in/admin/crm/reports`
      }
    ],
    attachments: [
      {
        content: base64Content,
        filename: `${schedule.report_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`,
        type: 'text/csv',
        disposition: 'attachment'
      }
    ],
    tracking_settings: {
      click_tracking: { enable: true },
      open_tracking: { enable: true }
    }
  };

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
  }

  // Log email sending event to email_delivery_logs
  if (supabaseClient) {
    try {
      for (const recipient of recipients) {
        await supabaseClient
          .from('email_delivery_logs')
          .insert({
            email_id: emailId,
            recipient: recipient.trim(),
            event_type: 'sent',
            campaign_type: 'scheduled_report',
            report_name: schedule.report_name,
            timestamp: new Date().toISOString(),
            metadata: {
              schedule_id: schedule.id,
              report_type: schedule.report_type
            }
          });
      }
    } catch (logError) {
      console.error('Error logging email send event:', logError);
      // Don't fail the email send if logging fails
    }
  }

  console.log(`Email sent successfully to: ${recipients.join(', ')}`);
}

function calculateNextRunTime(schedule: ReportSchedule, currentTime: Date): Date {
  const next = new Date(currentTime);

  if (schedule.frequency === 'Daily') {
    next.setDate(next.getDate() + 1);
  } else if (schedule.frequency === 'Weekly') {
    next.setDate(next.getDate() + 7);
  } else if (schedule.frequency === 'Monthly') {
    next.setMonth(next.getMonth() + 1);
  }

  // Set the time of day
  const [hours, minutes] = schedule.time_of_day.split(':');
  next.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  return next;
}
