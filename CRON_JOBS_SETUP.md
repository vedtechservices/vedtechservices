Automated Cron Jobs Setup Guide
This guide provides instructions for setting up automated cron jobs for VedTech Services CRM platform using Supabase pg_cron extension.

Overview
VedTech Services CRM requires two automated background jobs:

Daily Engagement Score Calculation: Recalculates customer engagement scores every day at 2:00 AM UTC
Hourly Scheduled Report Check: Checks for due scheduled reports and generates/sends them every hour
Prerequisites
Supabase project with pg_cron extension enabled
Super Admin access to Supabase dashboard
Supabase project reference and anon key
IMPORTANT: The pg_cron extension must be enabled by the Supabase support team. If you don't have access to pg_cron, contact Supabase support to enable it for your project.

Step 1: Enable pg_cron Extension
Option A: Via Supabase Dashboard (Recommended)
Log in to the Supabase dashboard: https://app.supabase.com
Select your VedTech Services project
Navigate to Database > Extensions in the left sidebar
Search for "pg_cron" in the extensions list
Click the "Enable" button next to pg_cron
Wait for the extension to be enabled (this may take a few seconds)
Option B: Via SQL Editor
Navigate to SQL Editor in the Supabase dashboard
Run the following SQL command:
CREATE EXTENSION IF NOT EXISTS pg_cron;
Click "Run" to execute the command
Verify Extension is Enabled
Run the following SQL query to verify pg_cron is enabled:

SELECT * FROM pg_extension WHERE extname = 'pg_cron';
If the query returns a row, pg_cron is successfully enabled.

Step 2: Get Your Supabase Project Details
You'll need the following information to configure the cron jobs:

2.1 Project Reference (Project URL)
In the Supabase dashboard, navigate to Project Settings > API
Copy the Project URL (e.g., https://abcdefghijklmnop.supabase.co)
Extract the project reference from the URL (e.g., abcdefghijklmnop)
2.2 Anon Key
In the same Project Settings > API page
Copy the anon public key (starts with eyJ...)
Store this key securely - you'll need it for the cron job configuration
Step 3: Configure Daily Engagement Score Calculation
3.1 Open SQL Editor
Navigate to SQL Editor in the Supabase dashboard
Click "New Query" to create a new SQL query
3.2 Create the Cron Job
Copy and paste the following SQL command, replacing the placeholders:

SELECT cron.schedule(
  'calculate-engagement-scores-daily',  -- Job name
  '0 2 * * *',                          -- Schedule: Every day at 2:00 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/calculate-engagement-scores',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
Replace the following placeholders:

YOUR_PROJECT_REF: Your Supabase project reference (e.g., abcdefghijklmnop)
YOUR_ANON_KEY: Your Supabase anon public key (starts with eyJ...)
Example:

SELECT cron.schedule(
  'calculate-engagement-scores-daily',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://abcdefghijklmnop.supabase.co/functions/v1/calculate-engagement-scores',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
3.3 Execute the Query
Click "Run" to execute the SQL command
If successful, you'll see a message: SELECT 1
The cron job is now scheduled and will run automatically every day at 2:00 AM UTC
Step 4: Configure Hourly Scheduled Report Check
4.1 Create the Cron Job
In the same SQL Editor, create a new query with the following SQL command:

SELECT cron.schedule(
  'generate-scheduled-reports-hourly',  -- Job name
  '0 * * * *',                          -- Schedule: Every hour at the top of the hour
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-scheduled-reports',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
Replace the placeholders with your actual project reference and anon key (same as Step 3).

4.2 Execute the Query
Click "Run" to execute the SQL command
If successful, you'll see a message: SELECT 1
The cron job is now scheduled and will run automatically every hour
Step 5: Verify Cron Jobs are Scheduled
5.1 List All Scheduled Jobs
Run the following SQL query to view all scheduled cron jobs:

SELECT * FROM cron.job;
You should see two rows:

calculate-engagement-scores-daily with schedule 0 2 * * *
generate-scheduled-reports-hourly with schedule 0 * * * *
5.2 Check Job Details
The query result will show:

jobid: Unique identifier for the job
schedule: Cron schedule expression
command: The SQL command that will be executed
nodename: The node where the job runs
nodeport: The port number
database: The database name
username: The user executing the job
active: Whether the job is active (should be true)
Step 6: Monitor Cron Job Execution
6.1 View Job Run History
Run the following SQL query to view the execution history of cron jobs:

SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
This will show:

jobid: The job that was executed
runid: Unique identifier for this execution
job_pid: Process ID
database: Database name
username: User who executed the job
command: The command that was executed
status: Execution status (succeeded, failed, running)
return_message: Any return message or error
start_time: When the job started
end_time: When the job completed
6.2 Check for Errors
To view only failed job executions:

SELECT * FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC
LIMIT 10;
Review the return_message column for error details.

Step 7: Test Cron Jobs Manually
7.1 Test Engagement Score Calculation
To manually trigger the engagement score calculation (without waiting for 2 AM UTC):

Navigate to Edge Functions in the Supabase dashboard
Select calculate-engagement-scores from the list
Click "Invoke" to manually trigger the function
Check the logs to verify successful execution
7.2 Test Scheduled Report Generation
To manually trigger the scheduled report check:

Navigate to Edge Functions in the Supabase dashboard
Select generate-scheduled-reports from the list
Click "Invoke" to manually trigger the function
Check the logs to verify successful execution
Cron Schedule Syntax Reference
The cron schedule uses the standard 5-field format:

* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, where 0 and 7 are Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
Examples:

0 2 * * * - Every day at 2:00 AM
0 * * * * - Every hour at the top of the hour
*/15 * * * * - Every 15 minutes
0 0 * * 0 - Every Sunday at midnight
0 9 1 * * - First day of every month at 9:00 AM
Troubleshooting
Issue 1: Cron Job Not Executing
Symptoms:

Job is scheduled but not running at the expected time
No entries in cron.job_run_details table
Solutions:

Verify Job is Active:

SELECT jobid, jobname, schedule, active FROM cron.job;
Ensure active is true
If active is false, the job is disabled
Check Job Schedule:

Verify the cron schedule expression is correct
Use an online cron expression validator (e.g., crontab.guru)
Verify pg_cron Extension:

SELECT * FROM pg_extension WHERE extname = 'pg_cron';
If no rows are returned, pg_cron is not enabled
Issue 2: Job Execution Fails
Symptoms:

Job runs but status is failed in cron.job_run_details
Error messages in return_message column
Solutions:

Check Error Message:

SELECT jobid, status, return_message, start_time
FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC
LIMIT 5;
Review the return_message for specific error details
Common Errors:

net.http_post function not found: Ensure the pg_net extension is enabled
401 Unauthorized: Invalid or expired anon key
404 Not Found: Incorrect Edge Function URL or function doesn't exist
500 Internal Server Error: Edge Function encountered an error (check Edge Function logs)
Enable pg_net Extension (if needed):

CREATE EXTENSION IF NOT EXISTS pg_net;
Issue 3: Incorrect Timezone
Symptoms:

Job runs at the wrong time
Expected to run at 2 AM local time but runs at a different time
Solutions:

Understand UTC Timezone:

All cron schedules in Supabase use UTC timezone
If you want the job to run at 2 AM IST (India Standard Time), schedule it for 8:30 PM UTC (previous day)
IST is UTC+5:30
Convert Local Time to UTC:

Use an online timezone converter
Example: 2:00 AM IST = 8:30 PM UTC (previous day)
Update the cron schedule accordingly:
SELECT cron.schedule(
  'calculate-engagement-scores-daily',
  '30 20 * * *',  -- 8:30 PM UTC = 2:00 AM IST
  $$ ... $$
);
Issue 4: Need to Update or Delete a Cron Job
To Update a Job:

First, unschedule the existing job:
SELECT cron.unschedule('calculate-engagement-scores-daily');
Then, create a new job with the updated configuration (see Step 3 or Step 4)
To Delete a Job:

SELECT cron.unschedule('job-name-here');
To Disable a Job (without deleting):

UPDATE cron.job
SET active = false
WHERE jobname = 'job-name-here';
To Re-enable a Disabled Job:

UPDATE cron.job
SET active = true
WHERE jobname = 'job-name-here';
Additional Resources
pg_cron Documentation: https://github.com/citusdata/pg_cron
Supabase pg_cron Guide: https://supabase.com/docs/guides/database/extensions/pg_cron
Cron Expression Validator: https://crontab.guru
Summary Checklist
Before considering the cron jobs setup complete, ensure:

[ ] pg_cron extension is enabled in your Supabase project
[ ] Daily engagement score calculation job is scheduled (0 2 * * *)
[ ] Hourly scheduled report check job is scheduled (0 * * * *)
[ ] Both jobs appear in cron.job table with active = true
[ ] Manually tested both Edge Functions to verify they work correctly
[ ] Monitored cron.job_run_details table for successful executions
[ ] Verified timezone is correct (UTC) and adjusted if needed
[ ] Documented the job names and schedules for future reference
Last Updated: January 2026
Version: 1.0
Maintained By: VedTech Services Development Team