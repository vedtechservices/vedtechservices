export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

// CRM Types
export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  customer_type: 'Individual' | 'Business';
  status: 'Active' | 'Inactive';
  registration_date: string;
  profile_photo: string | null;
  tags: string[] | null;
  notes: string | null;
  lifetime_value: number;
  health_score: 'Green' | 'Yellow' | 'Red';
  engagement_score?: number;
  country?: string;
  state?: string;
  city?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  lead_source: 'Website Form' | 'Phone Call' | 'Email' | 'Referral' | 'Social Media' | 'Other';
  lead_status: 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';
  assigned_sales_rep: string | null;
  estimated_deal_value: number;
  lead_score: number;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  campaign_name: string;
  campaign_type: 'Newsletter' | 'Promotional' | 'Announcement' | 'Follow-Up';
  subject_line: string;
  sender_name: string;
  sender_email: string;
  email_content: string;
  recipient_selection: Record<string, unknown> | null;
  status: 'Draft' | 'Scheduled' | 'Sent';
  scheduled_at: string | null;
  sent_at: string | null;
  recipients_count: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  unsubscribe_rate: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerSegment {
  id: string;
  segment_name: string;
  segment_criteria: Record<string, unknown>;
  customer_count: number;
  is_predefined: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallLog {
  id: string;
  customer_id: string | null;
  lead_id: string | null;
  call_type: 'Inbound' | 'Outbound';
  call_date: string;
  call_duration: number | null;
  call_outcome: 'Answered' | 'No Answer' | 'Voicemail' | 'Busy';
  notes: string | null;
  logged_by: string | null;
  created_at: string;
}

export interface Meeting {
  id: string;
  meeting_title: string;
  customer_id: string | null;
  lead_id: string | null;
  meeting_date: string;
  meeting_type: 'In-Person' | 'Phone' | 'Video Call';
  meeting_status: 'Scheduled' | 'Completed' | 'Cancelled';
  assigned_sales_rep: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  task_title: string;
  task_description: string | null;
  assigned_to: string | null;
  due_date: string | null;
  priority: 'High' | 'Medium' | 'Low';
  task_status: 'To Do' | 'In Progress' | 'Completed';
  related_customer_id: string | null;
  related_lead_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerFeedback {
  id: string;
  customer_id: string | null;
  feedback_type: 'Ticket Feedback' | 'Service Feedback' | 'General Feedback';
  rating: number | null;
  feedback_text: string | null;
  sentiment: 'Positive' | 'Neutral' | 'Negative' | null;
  created_at: string;
}

export interface Survey {
  id: string;
  survey_name: string;
  survey_description: string | null;
  survey_status: 'Draft' | 'Active' | 'Closed';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: 'text' | 'rating' | 'multiple_choice' | 'yes_no';
  options: string[] | null;
  required: boolean;
  question_order: number;
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  customer_id: string | null;
  response_data: Record<string, unknown>;
  submitted_at: string;
}

export interface CustomerSegment {
  id: string;
  segment_name: string;
  segment_criteria: Record<string, unknown>;
  customer_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerInteraction {
  id: string;
  customer_id: string | null;
  interaction_type: 'Ticket' | 'Email' | 'Call' | 'Meeting' | 'Note' | 'AMC Subscription';
  interaction_data: Record<string, unknown> | null;
  interaction_date: string;
  created_by: string | null;
  created_at: string;
}

export interface SurveyEmailTemplate {
  id: string;
  template_name: string;
  template_type: 'Survey Invitation' | 'Follow-Up' | 'Thank You';
  subject_line: string;
  message_body: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportSchedule {
  id: string;
  report_name: string;
  report_type: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  day_of_week?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  day_of_month?: number;
  time_of_day: string;
  export_format: 'PDF' | 'Excel' | 'Both';
  email_recipients: string[];
  email_subject: string;
  email_body?: string;
  date_range: string;
  is_active: boolean;
  next_run_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
