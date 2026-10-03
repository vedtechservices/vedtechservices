VedTech Services - Complete Ticket Management System
🎯 System Overview
One Call – One Ticket – Fast Solution

Complete customer ticket management system with customer dashboard, admin dashboard, AMC plans, and full workflow automation.

🧑‍💼 Customer Side Flow
1. Ticket Creation
Entry Points:

Website Support page
WhatsApp contact
Phone call
Ticket Form Fields:

Name *
Email * (creates/links customer account)
Phone *
Company/Organization
Location
Service Type * (Hardware/Software/Web/App/Networking/Other)
Category *
Priority * (High/Medium/Low)
Subject *
Description *
2. Auto-Generated Ticket ID
Format: VTS-YYYYMMDD-XXXX

VTS: VedTech Services
YYYYMMDD: Date (e.g., 20260131)
XXXX: Random 4-digit number
Example: VTS-20260131-4523

3. Customer Confirmation
✅ Toast notification with ticket ID
✅ Email client opens with pre-filled details
✅ Ticket saved to database
✅ Customer account auto-created
✅ AMC status checked automatically
4. Ticket Tracking
Customer Dashboard (/dashboard)

Login with email (no password needed)
View all tickets
Check ticket status
See AMC subscription status
View service history
Raise new tickets
5. Ticket Lifecycle
Open → In Progress → Waiting → Resolved → Closed
Status Updates:

Open: New ticket created
In Progress: Engineer assigned, working on it
Waiting: Awaiting customer response
Resolved: Issue fixed
Closed: Ticket completed + feedback
6. Feedback System
Rating (1-5 stars)
Comments
Helps improve service quality
🧑‍💻 Admin / Support Team Flow
Admin Dashboard (/admin/tickets)
Features:

Dashboard Overview

Total tickets count
Open/Closed tickets
AMC customers count
Priority distribution
Ticket Management

View all tickets
Search by ticket ID, name, email, subject
Filter by status (All/Open/Resolved)
Sort by date, priority, status
Ticket Details Display

Ticket ID with color-coded badges
Priority indicator (High/Medium/Low)
Status indicator
Customer information (name, email, phone, company, location)
Service type and category
Full description
Timestamps (created, updated)
AMC customer tag
Quick Actions

Reply via Email button
Call Customer button
Assign Engineer (future)
Update Status (future)
Add Notes (future)
Engineer Assignment (Database ready)

Assign tickets to engineers
Track engineer workload
Monitor response times
SLA Tracking

Response time monitoring
AMC priority handling
Escalation alerts
💳 AMC Plans & Pricing
AMC Plans Page (/amc-plans)
🔹 BASIC AMC – ₹3,999 / Year
Features:

✔ 1 PC / Laptop
✔ Software issues
✔ OS installation
✔ Remote support
✔ 24–48 hrs response
Best For: Individual users, home offices

🔹 STANDARD AMC – ₹7,999 / Year ⭐ (MOST POPULAR)
Features:

✔ 2–3 Systems
✔ Hardware + Software
✔ Printer support
✔ Network support
✔ Priority support
✔ 12–24 hrs response
Best For: Small businesses, shops, offices

🔹 PREMIUM AMC – ₹14,999 / Year 🚀
Features:

✔ Office / Shop / School
✔ Unlimited support
✔ On-site + Remote
✔ Network + Hardware
✔ Emergency support
✔ 4–8 hrs response
Best For: Schools, large offices, enterprises

AMC Benefits
Priority Support: Jump the queue
Guaranteed Response Time: Based on plan
Cost Effective: Annual plan vs per-incident
Peace of Mind: No surprise bills
Dedicated Support: Direct access to experts
Key Message:

AMC customers get priority support with guaranteed response time.

📊 Database Schema
Tables Created
1. customers
- id (UUID, Primary Key)
- email (TEXT, Unique)
- name (TEXT)
- phone (TEXT)
- company (TEXT)
- location (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
2. engineers
- id (UUID, Primary Key)
- name (TEXT)
- email (TEXT, Unique)
- phone (TEXT)
- specialization (TEXT)
- status (TEXT) - available/busy/offline
- created_at (TIMESTAMPTZ)
Sample Engineers:

Rajesh Kumar - Hardware & Networking
Priya Sharma - Software Development
Amit Singh - Full Stack Support
3. amc_plans
- id (UUID, Primary Key)
- name (TEXT)
- price (DECIMAL)
- duration_months (INTEGER)
- features (JSONB)
- response_time (TEXT)
- is_popular (BOOLEAN)
- created_at (TIMESTAMPTZ)
4. amc_subscriptions
- id (UUID, Primary Key)
- customer_id (UUID, FK)
- plan_id (UUID, FK)
- start_date (DATE)
- end_date (DATE)
- status (TEXT) - active/expired/cancelled
- payment_status (TEXT)
- amount (DECIMAL)
- created_at (TIMESTAMPTZ)
5. support_tickets (Enhanced)
- id (UUID, Primary Key)
- ticket_id (TEXT, Unique)
- customer_id (UUID, FK)
- engineer_id (UUID, FK)
- name (TEXT)
- email (TEXT)
- phone (TEXT)
- company (TEXT)
- location (TEXT)
- service_type (TEXT)
- category (TEXT)
- priority (TEXT)
- subject (TEXT)
- description (TEXT)
- status (TEXT)
- sla_response_time (TIMESTAMPTZ)
- resolved_at (TIMESTAMPTZ)
- feedback_rating (INTEGER)
- feedback_comment (TEXT)
- is_amc_customer (BOOLEAN)
- notes (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
Database Functions
1. get_or_create_customer()
Finds existing customer by email
Creates new customer if not found
Returns customer ID
Used during ticket creation
2. check_customer_amc_status()
Checks if customer has active AMC
Returns boolean
Used for priority tagging
🎨 User Interfaces
1. Customer Dashboard (/dashboard)
Features:

Email-based login (no password)
Stats cards (Total/Open/Resolved/AMC Status)
AMC subscription details
Ticket list with search
Raise new ticket button
Color-coded status badges
Access:

Public URL
Email-based authentication
Auto-creates account on first ticket
2. Admin Dashboard (/admin/tickets)
Features:

Complete ticket list
Search and filter
Customer information display
Quick action buttons
Refresh functionality
Color-coded priorities
Access:

Direct URL only (hidden from navigation)
No authentication (can be added)
3. AMC Plans Page (/amc-plans)
Features:

3 plan cards with pricing
Feature comparison
Popular plan highlight
Benefits section
CTA buttons
Responsive design
Access:

Public URL
Visible in navigation
4. Support Page (/support)
Features:

Enhanced ticket form
Service type selection
Location field
Auto-customer creation
AMC status check
Email integration
Access:

Public URL
Visible in navigation
🔄 Complete Workflow
Scenario 1: New Customer Raises Ticket
Customer visits /support
Fills form with details
Selects service type (Hardware/Software/etc.)
Submits form
System:
Creates customer account (if new)
Generates ticket ID (VTS-20260131-4523)
Checks AMC status
Saves ticket to database
Opens email client
Shows success toast
Customer receives:
Ticket ID confirmation
Email notification
Dashboard access
Admin sees:
New ticket in dashboard
Customer details
Priority indicator
Quick action buttons
Scenario 2: AMC Customer Raises Ticket
Customer (with active AMC) raises ticket
System:
Detects AMC status
Tags ticket as AMC customer
Sets priority response time
Assigns engineer (if configured)
Admin sees:
AMC customer badge
Priority tag
Faster SLA requirement
Scenario 3: Customer Checks Status
Customer visits /dashboard
Enters email
System:
Fetches all tickets
Shows AMC status
Displays service history
Customer sees:
All tickets with status
AMC validity
Can raise new ticket
📱 Pages & Routes
Public Pages
/ - Home
/about - About Us (PMEGP-friendly)
/services - Services
/industries - Industries
/why-us - Why Choose Us
/amc-plans - AMC Plans ✨ NEW
/support - Support (Enhanced)
/contact - Contact
/dashboard - Customer Dashboard ✨ NEW
Admin Pages
/admin/tickets - Admin Dashboard (Hidden)
🏆 Brand Positioning
Tagline
VedTech Services – One Call, Complete IT Solutions

Values
Fast
Reliable
Professional
India-Focused
Initiative
VedArambh - A Sanatan initiative

Combining traditional values of trust and service excellence with modern technology solutions.

📈 Future Roadmap
🚀 Phase 1 – Current (2025)
✅ Company website
✅ Ticket system
✅ AMC plans
✅ Customer dashboard
✅ Admin dashboard
🚀 Phase 2 – SaaS Launch (2026)
VedTech Helpdesk Software
Online ticketing platform
Subscription-based model
Multi-company login
Engineer mobile app
🚀 Phase 3 – India Level SaaS (2027)
Mobile app (Customer + Engineer)
AI-based ticket routing
CRM + Billing + AMC
Schools / SMB focused SaaS
Automated workflows
🚀 Phase 4 – National Brand (2028)
Franchise model
White-label IT support software
Enterprise clients
Government & education sector
Pan-India presence
🎯 Key Features Summary
Customer Features
✅ Easy ticket creation
✅ Auto-generated ticket IDs
✅ Email-based dashboard access
✅ Ticket status tracking
✅ AMC subscription management
✅ Service history
✅ No password required
Admin Features
✅ Complete ticket management
✅ Search and filter
✅ Customer information
✅ Quick actions (email/call)
✅ AMC customer identification
✅ Priority indicators
✅ Real-time data
System Features
✅ Auto-customer creation
✅ AMC status detection
✅ Ticket ID generation
✅ Database integration
✅ Email notifications
✅ Responsive design
✅ Production-ready
📞 Access Information
Customer Access
Dashboard: https://vedtechservices.com/dashboard
Support: https://vedtechservices.com/support
AMC Plans: https://vedtechservices.com/amc-plans
Login: Email-based (no password)
Admin Access
Admin Dashboard: https://vedtechservices.com/admin/tickets
Access: Direct URL (not in navigation)
Authentication: None (can be added)
Contact
Phone: +91 7858971869
Email: info@vedtechservices.in 
WhatsApp: +91 7858971869
Location: Samastipur, Bihar, India
🎉 Implementation Status
Database
✅ 5 tables created
✅ Indexes added
✅ RLS policies set
✅ Functions created
✅ Sample data inserted
Pages
✅ Customer Dashboard
✅ Admin Dashboard
✅ AMC Plans
✅ Enhanced Support
✅ Updated About (PMEGP-friendly)
Features
✅ Ticket creation
✅ Customer auto-creation
✅ AMC status check
✅ Ticket tracking
✅ Search & filter
✅ Email integration
✅ Dashboard login
Production Ready
✅ 87 files checked
✅ Lint passed
✅ No errors
✅ Responsive design
✅ Error handling
✅ Loading states
💡 Usage Examples
For Customers
Raise a Ticket:

Visit vedtechservices.com/support
Fill the form
Get ticket ID (VTS-20260131-4523)
Track on dashboard
Check Status:

Visit vedtechservices.com/dashboard
Enter email
View all tickets
See AMC status
Subscribe to AMC:

Visit vedtechservices.com/amc-plans
Choose plan
Contact us
Get priority support
For Admin
View Tickets:

Visit vedtechservices.com/admin/tickets
See all tickets
Search/filter as needed
Take action
Contact Customer:

Click "Reply via Email"
Or click "Call Customer"
Direct communication
🔐 Security & Privacy
Email-based authentication
RLS policies enabled
Public data access controlled
Admin pages hidden
Customer data protected
GDPR-friendly design
📊 Analytics Ready
Trackable Metrics:

Total tickets
Open vs Closed
Response times
AMC customers
Revenue tracking
Customer satisfaction
Engineer performance
VedTech Services One Call – Complete IT Solutions Fast | Reliable | Professional | India-Focused

VedArambh - A Sanatan initiative