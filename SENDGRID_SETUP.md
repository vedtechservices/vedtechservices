SendGrid API Configuration Guide
This guide provides step-by-step instructions for configuring SendGrid email service for VedTech Services CRM platform.

Table of Contents
Overview
Step 1: Create a SendGrid Account
Step 2: Generate SendGrid API Key
Step 3: Verify Sender Email Address
Step 4: Add API Key to Supabase
Step 5: Test Email Sending
Step 6: Monitor Email Activity
Troubleshooting
Overview
VedTech Services uses SendGrid as the email service provider for:

Scheduled report delivery with professional HTML templates
Customer notifications and alerts
Admin notifications for SLA breaches
Automated AMC renewal reminders
Survey invitations and follow-ups
Prerequisites:

Access to Supabase dashboard (Super Admin role)
Valid email address for sender verification
SendGrid account (free tier available)
Step 1: Create a SendGrid Account
1.1 Navigate to SendGrid Website
Open your web browser and go to: https://sendgrid.com
1.2 Sign Up for Free Account
Click on the "Start for Free" or "Sign Up" button
Complete the registration form with:
Email Address: Use a valid business email (e.g., info@vedtechservices.in )
Password: Create a strong password (minimum 8 characters)
Company Name: VedTech Services
Website: https://vedtechservices.in
1.3 Verify Your Email
Check your inbox for a verification email from SendGrid
Click the verification link in the email
Complete the email verification process
1.4 Complete Onboarding
Answer the onboarding questions:
Use Case: Transactional emails and notifications
Email Volume: Select appropriate tier (start with free tier: up to 100 emails/day)
Integration Method: Web API
Click "Get Started" to access the SendGrid dashboard
Step 2: Generate SendGrid API Key
2.1 Navigate to API Keys Section
Log in to your SendGrid account
Click on "Settings" in the left sidebar menu
Select "API Keys" from the dropdown
2.2 Create New API Key
Click the "Create API Key" button in the top-right corner
Enter a descriptive name for the API key:
API Key Name: VedTech Services Production
Naming Convention: Use environment-specific names (e.g., "VedTech Dev", "VedTech Staging")
2.3 Set API Key Permissions
Option A: Full Access (Recommended for Production)

Select "Full Access" permission level
This grants all necessary permissions for sending emails and accessing stats
Option B: Restricted Access (For Enhanced Security)

Select "Restricted Access"
Manually enable the following permissions:
Mail Send: Full Access ✅ (Required)
Mail Settings: Read Access (Optional)
Tracking: Read Access (Optional)
Stats: Read Access (Optional)
Leave all other permissions disabled
2.4 Generate and Copy API Key
Click the "Create & View" button
IMPORTANT: Copy the generated API key immediately
The API key will look like: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
This is the only time you'll see the full API key
Store the API key securely in a password manager or secure note
Click "Done" to close the modal
Security Best Practices:

✅ Never share your API key publicly
✅ Never commit API keys to version control (Git)
✅ Store API keys in environment variables only
✅ Rotate API keys periodically (every 90 days recommended)
✅ Use different API keys for development and production environments
Step 3: Verify Sender Email Address
SendGrid requires sender email verification to prevent spam and ensure deliverability.

3.1 Navigate to Sender Authentication
In the SendGrid dashboard, click on "Settings" in the left sidebar
Select "Sender Authentication"
3.2 Verify Single Sender
Click on the "Verify a Single Sender" button

Complete the sender verification form:

From Information:

From Name: VedTech Services
From Email Address: info@vedtechservices.in 
Reply To: info@vedtechservices.in 
Company Information:

Company Address: Samastipur, Bihar, India
City: Samastipur
State: Bihar
Zip Code: 848101 (or your actual zip code)
Country: India
Click the "Create" button to submit the verification request

3.3 Complete Email Verification
Check the inbox of info@vedtechservices.in 
Look for an email from SendGrid with subject: "SendGrid Sender Verification"
Click the "Verify Single Sender" button in the email
You'll be redirected to a confirmation page
Return to the SendGrid dashboard
3.4 Confirm Verification Status
Navigate back to Settings > Sender Authentication
Verify that info@vedtechservices.in  is marked as "Verified" with a green checkmark ✅
If not verified, repeat the verification process or check your spam folder
Troubleshooting Sender Verification:

If you don't receive the verification email within 5 minutes, check your spam/junk folder
Ensure the email address is correct and accessible
Try resending the verification email from the SendGrid dashboard
Contact SendGrid support if verification fails after multiple attempts
Step 4: Add API Key to Supabase
4.1 Access Supabase Dashboard
Open your web browser and navigate to: https://app.supabase.com
Log in with your Supabase account credentials
Select the VedTech Services project from the project list
4.2 Navigate to Edge Functions Settings
In the left sidebar, click on "Project Settings" (gear icon at the bottom)
Select "Edge Functions" from the settings menu
4.3 Add SendGrid API Key as Secret
Scroll down to the "Secrets" section

Click the "Add Secret" button

Enter the following details:

Secret Name: SENDGRID_API_KEY
Secret Value: Paste the SendGrid API key you copied in Step 2.4
Example: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Click the "Save" button to add the secret

4.4 Verify Secret Configuration
The SENDGRID_API_KEY secret should now appear in the Secrets list
The secret value will be masked (e.g., SG.xxxxx...)
The secret is now available to all Edge Functions in your Supabase project
Important Notes:

✅ The secret is encrypted and securely stored by Supabase
✅ Edge Functions can access the secret via Deno.env.get('SENDGRID_API_KEY')
✅ The secret is not exposed in client-side code
✅ You can update or delete the secret at any time from this page
Step 5: Test Email Sending
5.1 Test via Edge Function Invocation
In the Supabase dashboard, navigate to "Edge Functions" in the left sidebar
Select the generate-scheduled-reports function from the list
Click the "Invoke" button to manually trigger the function
Provide test input data (optional):
{}
Click "Invoke" to execute the function
Check the function execution logs for success messages
5.2 Verify Email Delivery
Check the recipient's inbox (the email address configured in a scheduled report)
Look for an email from VedTech Services Reports (info@vedtechservices.in )
Verify the email contains:
✅ Professional HTML template with VedTech branding
✅ Company logo and tagline
✅ Formatted report summary with key metrics
✅ Call-to-action button linking to CRM dashboard
✅ CSV attachment with report data
✅ Footer with company contact information
5.3 Test Email Rendering
Open the received email in different email clients:
Gmail (web and mobile app)
Outlook (web and desktop)
Apple Mail (macOS and iOS)
Verify that the HTML template renders correctly across all clients
Check that images, buttons, and links work properly
5.4 Check SendGrid Activity Feed
Log in to the SendGrid dashboard
Navigate to "Activity" in the left sidebar
Verify that the test email appears in the activity feed with status "Delivered"
Step 6: Monitor Email Activity
6.1 Access SendGrid Activity Dashboard
Log in to the SendGrid dashboard
Click on "Activity" in the left sidebar menu
6.2 View Real-Time Email Metrics
The Activity dashboard displays:

Total Emails Sent: Number of emails sent in the selected time period
Delivery Rate: Percentage of emails successfully delivered
Bounce Rate: Percentage of emails that bounced (hard or soft bounces)
Open Rate: Percentage of delivered emails that were opened by recipients
Click Rate: Percentage of delivered emails with clicked links
6.3 Filter and Search Activity
Use the date range filter to view activity for specific time periods
Use the search bar to find emails by recipient address or subject line
Click on any email entry to view detailed delivery information:
Delivery status (Delivered, Bounced, Deferred, Dropped)
Bounce reason (if applicable)
Open and click events
Recipient engagement timeline
6.4 Set Up Email Alerts (Optional)
Navigate to "Settings > Mail Settings" in the SendGrid dashboard
Enable "Event Notification" to receive webhooks for email events
Configure alerts for:
Bounce events (hard bounces)
Spam reports
Unsubscribe requests
Troubleshooting
Issue 1: Emails Not Being Sent
Symptoms:

Edge Function executes successfully but no emails are received
SendGrid Activity Feed shows no recent activity
Solutions:

Verify API Key Configuration:

Check that SENDGRID_API_KEY is correctly added to Supabase Edge Functions secrets
Ensure there are no extra spaces or characters in the API key
Verify the API key has Mail Send: Full Access permission
Check Sender Email Verification:

Navigate to Settings > Sender Authentication in SendGrid dashboard
Verify that info@vedtechservices.in  is marked as "Verified"
If not verified, complete the sender verification process (Step 3)
Review Edge Function Logs:

In Supabase dashboard, navigate to Edge Functions > generate-scheduled-reports
Click on "Logs" tab to view execution logs
Look for error messages related to SendGrid API calls
Common errors:
401 Unauthorized: Invalid API key
403 Forbidden: Sender email not verified
400 Bad Request: Invalid email format or missing required fields
Test API Key Manually:

Use a tool like Postman or curl to test the SendGrid API directly:
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "info@vedtechservices.in "},
    "subject": "Test Email",
    "content": [{"type": "text/plain", "value": "This is a test email."}]
  }'
Replace YOUR_API_KEY with your actual SendGrid API key
If this fails, the issue is with the API key or sender verification
Issue 2: Emails Being Marked as Spam
Symptoms:

Emails are delivered but land in the recipient's spam/junk folder
Low open rates despite high delivery rates
Solutions:

Authenticate Your Domain (Recommended):

Navigate to Settings > Sender Authentication in SendGrid dashboard
Click on "Authenticate Your Domain"
Follow the instructions to add DNS records (SPF, DKIM, DMARC) to your domain
This significantly improves email deliverability and sender reputation
Improve Email Content:

Avoid spam trigger words (e.g., "FREE", "URGENT", "ACT NOW")
Ensure a good text-to-image ratio (more text, fewer images)
Include a clear unsubscribe link in the footer
Use a professional email template (already implemented)
Warm Up Your Sender Reputation:

Start by sending emails to a small number of recipients
Gradually increase the volume over several days/weeks
Avoid sending large batches of emails immediately after account creation
Monitor Spam Reports:

Check SendGrid Activity Feed for spam reports
If recipients mark your emails as spam, investigate the content and frequency
Issue 3: High Bounce Rate
Symptoms:

Many emails are bouncing (not being delivered)
SendGrid Activity Feed shows high bounce rate
Solutions:

Identify Bounce Type:

Hard Bounce: Permanent delivery failure (invalid email address, domain doesn't exist)
Soft Bounce: Temporary delivery failure (mailbox full, server temporarily unavailable)
Clean Your Email List:

Remove invalid email addresses from your recipient list
Use email validation services to verify email addresses before sending
Implement double opt-in for new email subscriptions
Handle Bounces Automatically:

Set up SendGrid Event Webhook to receive bounce notifications
Automatically remove hard-bounced email addresses from your database
Retry soft-bounced emails after a delay
Issue 4: API Key Permissions Error
Symptoms:

SendGrid API returns 403 Forbidden error
Edge Function logs show "Insufficient permissions" error
Solutions:

Regenerate API Key with Correct Permissions:

Navigate to Settings > API Keys in SendGrid dashboard
Delete the existing API key (if necessary)
Create a new API key with Full Access or Mail Send: Full Access
Update the SENDGRID_API_KEY secret in Supabase with the new key
Verify API Key Status:

Ensure the API key is active and not expired
Check that the API key hasn't been revoked or deleted
Issue 5: Sender Email Not Verified
Symptoms:

SendGrid API returns 403 Forbidden error with message "Sender email not verified"
Emails are not being sent
Solutions:

Complete Sender Verification:

Follow Step 3 to verify your sender email address
Check your email inbox for the verification email from SendGrid
Click the verification link to complete the process
Use a Different Sender Email:

If you cannot verify info@vedtechservices.in , use a different email address
Update the sender email in the Edge Function code:
from: {
  email: 'your-verified-email@example.com',
  name: 'VedTech Services Reports'
}
Issue 6: Rate Limiting
Symptoms:

SendGrid API returns 429 Too Many Requests error
Emails are being throttled or delayed
Solutions:

Check Your SendGrid Plan Limits:

Free tier: 100 emails/day
Essentials tier: 40,000-100,000 emails/month
Pro tier: 1,500,000+ emails/month
Upgrade Your SendGrid Plan:

If you're exceeding the free tier limit, upgrade to a paid plan
Navigate to Settings > Account Details in SendGrid dashboard
Click "Upgrade" to view available plans
Implement Rate Limiting in Your Application:

Add delays between email sends to avoid hitting rate limits
Queue emails and send them in batches
Use SendGrid's batch sending API for bulk emails
Additional Resources
SendGrid Documentation
Official Documentation: https://docs.sendgrid.com
API Reference: https://docs.sendgrid.com/api-reference
Email Best Practices: https://sendgrid.com/resource/email-best-practices
Supabase Documentation
Edge Functions: https://supabase.com/docs/guides/functions
Environment Variables: https://supabase.com/docs/guides/functions/secrets
VedTech Services Support
Email: info@vedtechservices.in 
Phone: +91 7858971869
Website: https://vedtechservices.in
Summary Checklist
Before going live with SendGrid email integration, ensure you have completed all the following steps:

[ ] Created a SendGrid account and verified your email
[ ] Generated a SendGrid API key with Mail Send: Full Access permission
[ ] Verified the sender email address (info@vedtechservices.in )
[ ] Added SENDGRID_API_KEY secret to Supabase Edge Functions
[ ] Tested email sending via Edge Function invocation
[ ] Verified email delivery and HTML template rendering
[ ] Monitored SendGrid Activity Feed for delivery status
[ ] (Optional) Authenticated your domain for improved deliverability
[ ] (Optional) Set up email event webhooks for bounce handling
Last Updated: January 2026
Version: 1.0
Maintained By: VedTech Services Development Team