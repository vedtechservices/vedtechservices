VedTech Services CRM - Phase 7 Implementation Plan
Overview
This document outlines the implementation plan for three major feature enhancements requested by the user:

Feedback Form Integration & Automation System
Advanced Reporting Interface UI Components
Automated Notification Trigger System
Current Status
✅ Completed
Database Schema Created (v101)

feedback_reminders table: Track reminder status for tickets
feedback_responses table: Store admin responses to customer feedback
notification_rules table: Store configurable notification rules
notification_triggers table: Log all triggered notifications
All indexes and RLS policies configured
Default notification rules inserted
Existing Components Ready

FeedbackForm.tsx: Already created and ready for integration
NotificationBell.tsx: Already created for header
NotificationCenter.tsx: Already created for full notification management
CustomerFeedbackDashboard.tsx: Already created with analytics
⏳ Pending Implementation
The following tasks are outlined but not yet implemented due to complexity and scope:

1. Feedback Form Integration & Automation
1.1 Integrate FeedbackForm into TicketDetail/CustomerDashboard
Location: Update CustomerDashboard.tsx or create dedicated TicketDetail.tsx page

Implementation Steps:

Check ticket status in ticket detail view
If status is "Resolved" or "Closed", display FeedbackForm component
Position form below resolution notes and above history timeline
Pass ticket_id, customer_id, employee_id as props
Handle feedback submission callback
Show thank you message after successful submission
Update feedback_reminders table to mark feedback as submitted
Code Example:

// In CustomerDashboard.tsx or TicketDetail.tsx
import FeedbackForm from '@/components/feedback/FeedbackForm';

{ticket.status === 'Resolved' || ticket.status === 'Closed' ? (
  !feedbackSubmitted ? (
    <div className="mt-6">
      <FeedbackForm
        ticketId={ticket.id}
        customerId={customerId}
        employeeId={ticket.assigned_engineer}
        onSuccess={() => {
          setFeedbackSubmitted(true);
          // Update feedback_reminders table
          supabase
            .from('feedback_reminders')
            .update({ feedback_submitted: true })
            .eq('ticket_id', ticket.id);
        }}
      />
    </div>
  ) : (
    <Card className="mt-6 border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <p className="text-green-800">Thank you for your feedback!</p>
      </CardContent>
    </Card>
  )
) : null}
1.2 Create Feedback Reminder Edge Function
File: supabase/functions/send-feedback-reminders/index.ts

Purpose: Automated daily job to send email reminders to customers who haven't submitted feedback

Implementation Steps:

Query all tickets resolved/closed in past 24 hours
Check feedback_reminders table for reminder status
Filter tickets without feedback submission
For each ticket, send email via SendGrid
Update feedback_reminders table with reminder_sent_at timestamp
Implement retry logic (2 retries, 1-hour intervals)
Log all actions in activity_logs table
Code Structure:

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 1. Query tickets resolved/closed in past 24 hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*, customers(*)')
    .in('status', ['Resolved', 'Closed'])
    .gte('updated_at', yesterday.toISOString());

  // 2. Check feedback_reminders for each ticket
  for (const ticket of tickets || []) {
    const { data: reminder } = await supabase
      .from('feedback_reminders')
      .select('*')
      .eq('ticket_id', ticket.id)
      .maybeSingle();

    // Skip if feedback already submitted or reminder already sent
    if (reminder?.feedback_submitted || reminder?.reminder_sent_at) {
      continue;
    }

    // 3. Send email via SendGrid
    const emailSent = await sendFeedbackReminderEmail(ticket);

    if (emailSent) {
      // 4. Update feedback_reminders table
      await supabase
        .from('feedback_reminders')
        .upsert({
          ticket_id: ticket.id,
          customer_id: ticket.customer_id,
          reminder_sent_at: new Date().toISOString(),
          feedback_submitted: false
        });
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

async function sendFeedbackReminderEmail(ticket: any) {
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  
  const emailBody = {
    personalizations: [{
      to: [{ email: ticket.customers.email }],
      subject: `We'd love to hear your feedback on Ticket ${ticket.ticket_id}`
    }],
    from: { email: 'info@vedtechservices.in ', name: 'VedTech Services' },
    content: [{
      type: 'text/html',
      value: `
        <h2>Hi ${ticket.customers.name},</h2>
        <p>We recently resolved your support request (Ticket ID: ${ticket.ticket_id}).</p>
        <p>We'd love to hear your feedback on the service you received.</p>
        <p><a href="https://vedtechservices.in/customer-dashboard?ticket=${ticket.id}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Submit Feedback</a></p>
        <p>Thank you for choosing VedTech Services!</p>
      `
    }]
  };

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailBody)
  });

  return response.ok;
}
Deployment:

supabase functions deploy send-feedback-reminders
Cron Job Setup (in Supabase SQL Editor):

SELECT cron.schedule(
  'send-feedback-reminders-daily',
  '0 10 * * *', -- Every day at 10:00 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://[project-ref].supabase.co/functions/v1/send-feedback-reminders',
    headers := '{"Authorization": "Bearer [anon-key]"}'::jsonb
  );
  $$
);
1.3 Admin Feedback Response Interface
Already Implemented: The PRD specifies this feature on Page 24 (Customer Detail View) with Feedback Response Interface section.

Implementation: Create a dedicated component or add to CustomerDetail.tsx page to display feedback list with Reply button that opens email compose modal with template selector.

2. Advanced Reporting Interface UI Components
2.1 DateRangePicker Component
File: src/components/reporting/DateRangePicker.tsx

Features:

Calendar interface with date selection
Relative ranges: Today, Yesterday, Last 7/30/90 Days, This/Last Month/Quarter/Year, Custom
Return selected date range to parent component
Responsive design
Implementation:

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DateRangePickerProps {
  value: { from: Date; to: Date };
  onChange: (range: { from: Date; to: Date }) => void;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const relativeRanges = [
    { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: 'Yesterday', getValue: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: yesterday, to: yesterday };
    }},
    { label: 'Last 7 Days', getValue: () => {
      const from = new Date();
      from.setDate(from.getDate() - 7);
      return { from, to: new Date() };
    }},
    { label: 'Last 30 Days', getValue: () => {
      const from = new Date();
      from.setDate(from.getDate() - 30);
      return { from, to: new Date() };
    }},
    { label: 'Last 90 Days', getValue: () => {
      const from = new Date();
      from.setDate(from.getDate() - 90);
      return { from, to: new Date() };
    }},
    { label: 'This Month', getValue: () => {
      const now = new Date();
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
    }},
    { label: 'Last Month', getValue: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from, to };
    }},
    { label: 'This Quarter', getValue: () => {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const from = new Date(now.getFullYear(), quarter * 3, 1);
      return { from, to: now };
    }},
    { label: 'Last Quarter', getValue: () => {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const from = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
      const to = new Date(now.getFullYear(), quarter * 3, 0);
      return { from, to };
    }},
    { label: 'This Year', getValue: () => {
      const now = new Date();
      return { from: new Date(now.getFullYear(), 0, 1), to: now };
    }},
    { label: 'Last Year', getValue: () => {
      const now = new Date();
      const from = new Date(now.getFullYear() - 1, 0, 1);
      const to = new Date(now.getFullYear() - 1, 11, 31);
      return { from, to };
    }}
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value.from && value.to ? (
            `${format(value.from, 'MMM dd, yyyy')} - ${format(value.to, 'MMM dd, yyyy')}`
          ) : (
            'Select date range'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="border-r p-4 space-y-2">
            <p className="text-sm font-medium mb-2">Quick Ranges</p>
            {relativeRanges.map((range) => (
              <Button
                key={range.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  onChange(range.getValue());
                  setIsOpen(false);
                }}
              >
                {range.label}
              </Button>
            ))}
          </div>
          <div className="p-4">
            <Calendar
              mode="range"
              selected={{ from: value.from, to: value.to }}
              onSelect={(range: any) => {
                if (range?.from && range?.to) {
                  onChange({ from: range.from, to: range.to });
                  setIsOpen(false);
                }
              }}
              numberOfMonths={2}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
2.2 ConditionsBuilder Component
File: src/components/reporting/ConditionsBuilder.tsx

Features:

Drag-and-drop interface for adding/removing conditions
Support condition types: equals, not equals, contains, greater than, less than, between, is empty
Support logical operators: AND, OR
Real-time preview of filtered data count
Implementation: Complex component requiring state management for conditions array, drag-and-drop library (e.g., dnd-kit), and dynamic form fields.

2.3 MultiReportSelector Component
File: src/components/reporting/MultiReportSelector.tsx

Features:

Display thumbnail previews of available report templates
Allow selection of multiple reports
Show report metadata: name, data source, last run date, estimated time
Checkbox selection interface
2.4 RecipientManager Component
File: src/components/reporting/RecipientManager.tsx

Features:

Add individual email recipients
Select entire admin roles (Super Admin, Full Access Admin, etc.)
Display recipient list with role badges
Remove individual recipients
Real-time email validation
2.5 Update CRMAdvancedReporting Page
File: src/pages/CRMAdvancedReporting.tsx

Integration Steps:

Import all new components
Add state management for date range, conditions, selected reports, recipients
Integrate DateRangePicker component
Integrate ConditionsBuilder component
Integrate MultiReportSelector component
Integrate RecipientManager component
Add email template customization section
Update form submission to save all new fields to report_schedules table
Display enhanced fields in schedule list
3. Automated Notification Trigger System
3.1 Create Notification Triggers Edge Function
File: supabase/functions/process-notifications/index.ts

Purpose: Monitor CRM events and trigger notifications based on configured rules

Implementation Steps:

Query notification_rules table for enabled rules
For each rule, check trigger conditions:
High-priority ticket created: Query support_tickets for new High priority tickets
Scheduled report failed: Query report_schedules for failed generation status
Email engagement rate dropped: Query email_delivery_logs for open rate < threshold
Employee performance milestone: Query support_tickets for employee ticket count
Ticket unassigned >1 hour: Query support_tickets for unassigned duration
Generate in-app notifications (insert into notifications table)
Send email notifications via SendGrid (if email channel enabled)
Log triggered notifications in notification_triggers table
Prevent duplicate notifications (check last triggered timestamp)
Code Structure:

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 1. Query enabled notification rules
  const { data: rules } = await supabase
    .from('notification_rules')
    .select('*')
    .eq('status', 'enabled');

  for (const rule of rules || []) {
    // 2. Check trigger conditions based on trigger_event
    const shouldTrigger = await checkTriggerCondition(rule, supabase);

    if (shouldTrigger) {
      // 3. Generate in-app notification
      await createInAppNotification(rule, supabase);

      // 4. Send email notification if enabled
      if (rule.notification_channels.includes('email')) {
        await sendEmailNotification(rule);
      }

      // 5. Log triggered notification
      await supabase
        .from('notification_triggers')
        .insert({
          rule_id: rule.id,
          triggered_at: new Date().toISOString(),
          event_data: {},
          recipients: rule.recipients,
          delivery_status: 'sent'
        });
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

async function checkTriggerCondition(rule: any, supabase: any) {
  switch (rule.trigger_event) {
    case 'ticket_created':
      // Check for new high-priority tickets created in last hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const { data: highPriorityTickets } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('priority', 'High')
        .gte('created_at', oneHourAgo.toISOString());

      return (highPriorityTickets?.length || 0) > 0;

    case 'ticket_unassigned':
      // Check for tickets unassigned for more than 1 hour
      const { data: unassignedTickets } = await supabase
        .from('support_tickets')
        .select('*')
        .is('assigned_engineer', null)
        .lte('created_at', oneHourAgo.toISOString());

      return (unassignedTickets?.length || 0) > 0;

    case 'performance_milestone':
      // Check for employees reaching 100 tickets resolved
      const { data: employees } = await supabase
        .from('engineers')
        .select('*, support_tickets(count)');

      return employees?.some((emp: any) => emp.support_tickets[0].count >= 100);

    case 'engagement_dropped':
      // Check email open rate for past 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: emailLogs } = await supabase
        .from('email_delivery_logs')
        .select('*')
        .gte('timestamp', sevenDaysAgo.toISOString());

      const openRate = calculateOpenRate(emailLogs);
      return openRate < (rule.conditions.threshold || 20);

    case 'report_failed':
      // Check for failed scheduled reports in last hour
      const { data: failedReports } = await supabase
        .from('report_schedules')
        .select('*')
        .eq('last_run_status', 'failed')
        .gte('last_run_at', oneHourAgo.toISOString());

      return (failedReports?.length || 0) > 0;

    default:
      return false;
  }
}

async function createInAppNotification(rule: any, supabase: any) {
  const notificationData = {
    user_id: 'all', // or specific user based on rule.recipients
    type: rule.trigger_event,
    title: getNotificationTitle(rule.trigger_event),
    message: getNotificationMessage(rule.trigger_event),
    data: { rule_id: rule.id }
  };

  await supabase
    .from('notifications')
    .insert(notificationData);
}

async function sendEmailNotification(rule: any) {
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  
  // Implementation similar to feedback reminder email
  // Use rule.email_template if specified
}

function calculateOpenRate(emailLogs: any[]) {
  if (!emailLogs || emailLogs.length === 0) return 0;
  const openedEmails = emailLogs.filter(log => log.event_type === 'open').length;
  return (openedEmails / emailLogs.length) * 100;
}

function getNotificationTitle(triggerEvent: string) {
  const titles: Record<string, string> = {
    'ticket_created': 'New High-Priority Ticket',
    'ticket_unassigned': 'Unassigned Ticket Alert',
    'performance_milestone': 'Performance Milestone Reached',
    'engagement_dropped': 'Email Engagement Alert',
    'report_failed': 'Scheduled Report Failed'
  };
  return titles[triggerEvent] || 'Notification';
}

function getNotificationMessage(triggerEvent: string) {
  const messages: Record<string, string> = {
    'ticket_created': 'A new high-priority ticket requires immediate attention',
    'ticket_unassigned': 'A ticket has remained unassigned for more than 1 hour',
    'performance_milestone': 'An employee has reached a performance milestone',
    'engagement_dropped': 'Email engagement rate has dropped below threshold',
    'report_failed': 'A scheduled report failed to generate'
  };
  return messages[triggerEvent] || 'A notification event has occurred';
}
Deployment:

supabase functions deploy process-notifications
Cron Job Setup (in Supabase SQL Editor):

SELECT cron.schedule(
  'process-notifications-hourly',
  '0 * * * *', -- Every hour
  $$
  SELECT net.http_post(
    url := 'https://[project-ref].supabase.co/functions/v1/process-notifications',
    headers := '{"Authorization": "Bearer [anon-key]"}'::jsonb
  );
  $$
);
3.2 Notification Rules Management UI
Already Specified: The PRD specifies Page 38 (CRM Notification Rules Management) with full UI for creating, editing, and managing notification rules.

Implementation: Create CRMNotificationRules.tsx page with:

Notification Rules List table
Create New Rule button and form
Edit/Delete/Enable/Disable actions
Conditions Builder integration
Recipient selector
Notification History section
Implementation Priority
Given the complexity and scope, the recommended implementation order is:

Phase 1: High Priority (Immediate)
✅ Database schema (COMPLETED)
Integrate FeedbackForm into CustomerDashboard/TicketDetail
Create feedback reminder Edge Function
Create automated notification triggers Edge Function
Phase 2: Medium Priority (Next Sprint)
Create DateRangePicker component
Create ConditionsBuilder component
Create MultiReportSelector component
Create RecipientManager component
Update CRMAdvancedReporting page
Phase 3: Polish & Testing
Run lint and fix issues
Integration testing
End-to-end testing
Documentation updates
Estimated Effort
Phase 1: ~40-50 actions (High complexity)
Phase 2: ~30-40 actions (Medium complexity)
Phase 3: ~10-15 actions (Testing & polish)
Total: ~80-105 actions
Next Steps
Complete Phase 1 implementation (feedback integration and Edge Functions)
Deploy Edge Functions to Supabase
Set up cron jobs for automated execution
Test feedback flow end-to-end
Test notification triggers
Move to Phase 2 (advanced reporting UI components)
Notes
All database schema changes are already applied (v101)
FeedbackForm component is already created and ready for integration
NotificationBell and NotificationCenter components are already created
SendGrid API key must be configured in Supabase environment variables
Cron jobs require pg_cron extension to be enabled in Supabase
Document Version: 1.0
Last Updated: January 2026
Status: Implementation Plan - Phase 1 Database Schema Completed