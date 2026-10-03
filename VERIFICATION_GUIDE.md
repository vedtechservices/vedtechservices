VedTech Services - Feature Verification Guide
This guide provides step-by-step instructions to verify the three key administrative features.

✅ Feature 1: SLA Breach Notification Verification
What to Test
Verify that the SLA monitoring system correctly identifies breached escalations and displays notification status badges.

Current State
Test Escalation ID: dabffaa3-c068-4df2-8de3-a036d2904f9f
Customer Name: SLA Test Admin
Priority: High (15-minute SLA target)
Status: Pending (no first response)
Elapsed Time: ~1819 minutes (BREACHED)
Notification Status: Not yet notified
Steps to Verify
Navigate to Chat Escalations

Go to Admin Dashboard → Chat Escalations
URL: /admin/chat-escalations
Locate the Test Escalation

Look for the card with customer name "SLA Test Admin"
Note: Currently shows no notification badge
Trigger SLA Monitor

Click the "Run SLA Monitor" button in the header
This button has an Activity icon and is located next to "Create Test (SLA)"
Verify Results

After clicking, you should see a toast notification: "SLA Monitor Executed - Sent X notifications"
The "SLA Test Admin" card should now display a red "BREACH EMAIL SENT" badge
The card's SLA status should update to "SLA Breached"
Expected Behavior
✅ Monitor identifies escalation as breached (elapsed time > 15 minutes)
✅ Email notification sent to all active admins
✅ Badge appears on the escalation card
✅ Database updated with sla_breach_notified_at timestamp
✅ Feature 2: AI Knowledge Base Article Generation
What to Test
Verify that the AI assistant can analyze customer queries and automatically generate comprehensive troubleshooting articles.

Current State
Sample Escalation: "Server Downtime" query exists
Message: "Our production server is down with a 500 error. Need urgent help with Server Downtime troubleshooting."
Status: Ready for AI processing
Steps to Verify
Navigate to Knowledge Base Management

Go to Admin Dashboard → Knowledge Base
URL: /admin/knowledge-base
Trigger AI Topic Suggestion

Click the "AI Generate from Queries" button (has Sparkles icon)
This analyzes the last 30 customer escalations
Select Server Downtime Topic

A modal will appear with suggested topics
Look for "Server Downtime" or similar topic in the list
Click "Generate Article" on that topic
Review Generated Article

The AI will generate a complete article with:
Title: Professional article title
Content: Step-by-step troubleshooting guide
Category: Automatically suggested (likely "Hardware" or "Software")
Tags: Relevant keywords
Excerpt: SEO-friendly summary
Review the content in the article editor dialog
Save the Article

Click "Save Article" to add it to the Knowledge Base
The article will appear in the articles list
Expected Behavior
✅ AI identifies "Server Downtime" as a common topic
✅ Generated article includes structured troubleshooting steps
✅ Category and tags are automatically suggested
✅ Article is saved and immediately available in the Knowledge Base
✅ Feature 3: Regional Revenue Forecast with Global Benchmark
What to Test
Verify that the Performance dashboard displays regional revenue forecasts with a comparative global average line.

Current State
Asia-Pacific Data: 6 invoices totaling ₹635,000
Other Regions: Europe (1), Middle East (1), North America (2)
Forecast Algorithm: Uses 90-day rolling average with 2% monthly growth
Steps to Verify
Navigate to Performance Dashboard

Go to Admin Dashboard → Performance
URL: /admin/performance
Locate Revenue Forecast Section

Scroll down to the "Revenue Forecast (6 Months)" card
This is in the lower section of the page
Select Asia-Pacific Region

Click the region dropdown (default: "All Regions")
Select "Asia-Pacific" from the list
Analyze the Chart

Solid Blue Line: Asia-Pacific regional forecast
Dashed Gray Line: Global Average benchmark
Compare the two lines to see regional performance vs. global trends
Interpret the Data

If Asia-Pacific line is above Global Average → Region is outperforming
If Asia-Pacific line is below Global Average → Region is underperforming
The gap between lines shows the performance deviation
Expected Behavior
✅ Dropdown filters to show only Asia-Pacific data
✅ Solid line shows Asia-Pacific projected revenue
✅ Dashed line shows Global Average for comparison
✅ Chart updates dynamically when changing regions
✅ Tooltip shows exact values when hovering over data points
🔧 Technical Implementation Details
SLA Monitor Edge Function
Location: supabase/functions/monitor-slas/index.ts
Logic:
Fetches pending escalations with no first response
Calculates elapsed time vs. SLA target
Sends email if breached (100%) or approaching (80%)
Updates database with notification timestamps
AI KB Assistant Edge Function
Location: supabase/functions/ai-kb-assistant/index.ts
Actions:
suggest-topics: Analyzes last 30 escalations, returns 5 common topics
generate-article: Creates full article with structured content
categorize: Suggests category based on content
Revenue Forecast Algorithm
Location: src/pages/AdminPerformance.tsx (lines 395-426)
Logic:
Calculates 90-day rolling average per region
Projects 6 months forward with 2% monthly growth
Computes Global Average across all regions
Displays both lines when a specific region is selected
📊 Database Verification Queries
If you need to verify the backend state, use these SQL queries:

-- Check test escalation status
SELECT id, customer_name, priority, status, 
       sla_breach_notified_at, sla_approaching_notified_at,
       EXTRACT(EPOCH FROM (NOW() - created_at))/60 as elapsed_minutes
FROM chatbot_escalations 
WHERE is_test = TRUE;

-- Check Server Downtime sample
SELECT id, message, is_sample, status
FROM chatbot_escalations 
WHERE message ILIKE '%Server Downtime%' AND is_sample = TRUE;

-- Check Asia-Pacific invoices
SELECT region, COUNT(*), SUM(amount), currency
FROM service_invoices 
WHERE region = 'Asia-Pacific'
GROUP BY region, currency;
🎯 Success Criteria
All three features are successfully verified when:

✅ SLA Monitor: "BREACH EMAIL SENT" badge appears on test escalation card
✅ AI KB: "Server Downtime" article is generated with structured content
✅ Regional Forecast: Asia-Pacific line and Global Average line both visible on chart
🚨 Troubleshooting
SLA Monitor Not Working
Verify RESEND_API_KEY is configured in Supabase secrets
Check that admin_users table has active admins with valid emails
Review edge function logs: supabase functions logs monitor-slas
AI Generation Failing
Verify GEMINI_API_KEY is configured in Supabase secrets
Check that chat-ai edge function is deployed
Ensure chatbot_escalations table has sample data
Regional Forecast Not Showing
Verify service_invoices table has data with region field populated
Check that paid_at dates are within the last 90 days
Ensure exchange rates are configured if using multiple currencies
Last Updated: 2026-04-25
Version: v87