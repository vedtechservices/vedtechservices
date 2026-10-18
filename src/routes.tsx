import { lazy, type ReactNode } from 'react';

const Home = lazy(() => import('./views/Home'));
const About = lazy(() => import('./views/About'));
const Services = lazy(() => import('./views/Services'));
const SoftwareServices = lazy(() => import('./views/SoftwareServices'));
const HardwareServices = lazy(() => import('./views/HardwareServices'));
const ITSupportServices = lazy(() => import('./views/ITSupportServices'));
const WebDevelopment = lazy(() => import('./views/WebDevelopment'));
const MobileAppDevelopment = lazy(() => import('./views/MobileAppDevelopment'));
const HardwareRepair = lazy(() => import('./views/HardwareRepair'));
const NetworkingSolutions = lazy(() => import('./views/NetworkingSolutions'));
const Industries = lazy(() => import('./views/Industries'));
const EducationalInstitutions = lazy(() => import('./views/EducationalInstitutions'));
const CorporateOffices = lazy(() => import('./views/CorporateOffices'));
const RetailShops = lazy(() => import('./views/RetailShops'));
const Healthcare = lazy(() => import('./views/Healthcare'));
const Manufacturing = lazy(() => import('./views/Manufacturing'));
const StartupsSMEs = lazy(() => import('./views/StartupsSMEs'));
const WhyUs = lazy(() => import('./views/WhyUs'));
const Support = lazy(() => import('./views/Support'));
const Contact = lazy(() => import('./views/Contact'));
const Blog = lazy(() => import('./views/Blog'));
const BlogDetail = lazy(() => import('./views/BlogDetail'));
const Demo = lazy(() => import('./views/Demo'));
const AdminLogin = lazy(() => import('./views/AdminLogin'));
const AdminDashboard = lazy(() => import('./views/AdminDashboard'));
const AdminTickets = lazy(() => import('./views/AdminTickets'));
const AdminReviews = lazy(() => import('./views/AdminReviews'));
const AdminSettings = lazy(() => import('./views/AdminSettings'));
const EngineerManagement = lazy(() => import('./views/EngineerManagement'));
const AMCPlans = lazy(() => import('./views/AMCPlans'));
const CustomerDashboard = lazy(() => import('./views/CustomerDashboard'));
const EngineerDashboard = lazy(() => import('./views/EngineerDashboard'));
const AdminManagement = lazy(() => import('./views/AdminManagement'));
const EmployeeManagement = lazy(() => import('./views/EmployeeManagement'));
const EmployeeLogin = lazy(() => import('./views/EmployeeLogin'));
const EmployeeSignup = lazy(() => import('./views/EmployeeSignup'));
const ActivityLogs = lazy(() => import('./views/ActivityLogs'));
const AccountSettings = lazy(() => import('./views/AccountSettings'));
const AdminAuditLogs = lazy(() => import('./views/AdminAuditLogs'));
const AdminPerformance = lazy(() => import('./views/AdminPerformance'));
const AdminInventory = lazy(() => import('./views/AdminInventory'));
const AdminBilling = lazy(() => import('./views/AdminBilling'));
const AdminChatEscalations = lazy(() => import('./views/AdminChatEscalations'));
const AdminKnowledgeBase = lazy(() => import('./views/AdminKnowledgeBase'));
const AdminCronMonitor = lazy(() => import('./views/AdminCronMonitor'));
const AdminOffices = lazy(() => import('./views/AdminOffices'));
const AdminEmailTemplateSettings = lazy(() => import('./views/AdminEmailTemplateSettings'));
const EmployeePerformanceDashboard = lazy(() => import('./views/EmployeePerformanceDashboard'));
const EmailAnalyticsDashboard = lazy(() => import('./views/EmailAnalyticsDashboard'));
const CustomerFeedbackDashboard = lazy(() => import('./views/CustomerFeedbackDashboard'));
const NotificationCenter = lazy(() => import('./views/NotificationCenter'));
const CRMDashboard = lazy(() => import('./views/CRMDashboard'));
const LeadManagement = lazy(() => import('./views/LeadManagement'));
const LeadDetail = lazy(() => import('./views/LeadDetail'));
const SalesPipeline = lazy(() => import('./views/SalesPipeline'));
const CustomerDetail = lazy(() => import('./views/CustomerDetail'));
const EmailCampaigns = lazy(() => import('./views/EmailCampaigns'));
const CallLogs = lazy(() => import('./views/CallLogs'));
const MeetingScheduler = lazy(() => import('./views/MeetingScheduler'));
const TaskManagement = lazy(() => import('./views/TaskManagement'));
const CRMAdvancedReporting = lazy(() => import('./views/CRMAdvancedReporting'));
const CRMAnalyticsDashboard = lazy(() => import('./views/CRMAnalyticsDashboard'));
const CustomerSegmentation = lazy(() => import('./views/CustomerSegmentation'));
const CustomerFeedbackSurveys = lazy(() => import('./views/CustomerFeedbackSurveys'));
const CustomerReportsAnalytics = lazy(() => import('./views/CustomerReportsAnalytics'));
const CRMAuditLogs = lazy(() => import('./views/CRMAuditLogs'));
const PrivacyPolicy = lazy(() => import('./views/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./views/TermsOfService'));

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />
  },
  {
    name: 'About',
    path: '/about',
    element: <About />
  },
  {
    name: 'Services',
    path: '/services',
    element: <Services />
  },
  {
    name: 'Software Services',
    path: '/services/software',
    element: <SoftwareServices />,
    visible: false
  },
  {
    name: 'Hardware Services',
    path: '/services/hardware',
    element: <HardwareServices />,
    visible: false
  },
  {
    name: 'IT Support Services',
    path: '/services/it-support',
    element: <ITSupportServices />,
    visible: false
  },
  {
    name: 'Web Development',
    path: '/services/web-development',
    element: <WebDevelopment />,
    visible: false
  },
  {
    name: 'Mobile App Development',
    path: '/services/mobile-app-development',
    element: <MobileAppDevelopment />,
    visible: false
  },
  {
    name: 'Hardware Repair',
    path: '/services/hardware-repair',
    element: <HardwareRepair />,
    visible: false
  },
  {
    name: 'Networking Solutions',
    path: '/services/networking-solutions',
    element: <NetworkingSolutions />,
    visible: false
  },
  {
    name: 'Industries',
    path: '/industries',
    element: <Industries />
  },
  {
    name: 'Educational Institutions',
    path: '/industries/educational-institutions',
    element: <EducationalInstitutions />,
    visible: false
  },
  {
    name: 'Corporate Offices',
    path: '/industries/corporate-offices',
    element: <CorporateOffices />,
    visible: false
  },
  {
    name: 'Retail & Shops',
    path: '/industries/retail-shops',
    element: <RetailShops />,
    visible: false
  },
  {
    name: 'Startups & SMEs',
    path: '/industries/startups-smes',
    element: <StartupsSMEs />,
    visible: false
  },
  {
    name: 'Healthcare',
    path: '/industries/healthcare',
    element: <Healthcare />,
    visible: false
  },
  {
    name: 'Manufacturing',
    path: '/industries/manufacturing',
    element: <Manufacturing />,
    visible: false
  },
  {
    name: 'Why Us',
    path: '/why-us',
    element: <WhyUs />
  },
  {
    name: 'AMC Plans',
    path: '/amc-plans',
    element: <AMCPlans />
  },
  {
    name: 'Support',
    path: '/support',
    element: <Support />
  },
  {
    name: 'Contact',
    path: '/contact',
    element: <Contact />
  },
  {
    name: 'Privacy Policy',
    path: '/privacy',
    element: <PrivacyPolicy />,
    visible: false
  },
  {
    name: 'Terms of Service',
    path: '/terms',
    element: <TermsOfService />,
    visible: false
  },
  {
    name: 'Blog',
    path: '/blog',
    element: <Blog />
  },
  {
    name: 'Blog Detail',
    path: '/blog/:id',
    element: <BlogDetail />,
    visible: false
  },
  {
    name: 'Demo',
    path: '/demo',
    element: <Demo />
  },
  {
    name: 'My Dashboard',
    path: '/dashboard',
    element: <CustomerDashboard />
  },
  {
    name: 'Admin Login',
    path: '/admin/login',
    element: <AdminLogin />,
    visible: false
  },
  {
    name: 'Admin Dashboard',
    path: '/admin/dashboard',
    element: <AdminDashboard />,
    visible: false
  },
  {
    name: 'Admin Tickets',
    path: '/admin/tickets',
    element: <AdminTickets />,
    visible: false
  },
  {
    name: 'Admin Reviews',
    path: '/admin/reviews',
    element: <AdminReviews />,
    visible: false
  },
  {
    name: 'Admin Settings',
    path: '/admin/settings',
    element: <AdminSettings />,
    visible: false
  },
  {
    name: 'Manage Admins',
    path: '/admin/manage',
    element: <AdminManagement />,
    visible: false
  },
  {
    name: 'Manage Team',
    path: '/admin/team',
    element: <EmployeeManagement />,
    visible: false
  },
  {
    name: 'Employee Registration',
    path: '/employee/signup',
    element: <EmployeeSignup />,
    visible: false
  },
  {
    name: 'Engineer Management',
    path: '/admin/engineers',
    element: <EngineerManagement />,
    visible: false
  },
  {
    name: 'Employee Login',
    path: '/employee/login',
    element: <EmployeeLogin />,
    visible: false
  },
  {
    name: 'Engineer Dashboard',
    path: '/engineer/dashboard',
    element: <EngineerDashboard />,
    visible: false
  },
  {
    name: 'Account Settings',
    path: '/settings',
    element: <AccountSettings />,
    visible: false
  },
  {
    name: 'Activity Logs',
    path: '/admin/logs',
    element: <ActivityLogs />,
    visible: false
  },
  {
    name: 'Security Audit Logs',
    path: '/admin/audit-logs',
    element: <AdminAuditLogs />,
    visible: false
  },
  {
    name: 'Performance Analytics',
    path: '/admin/performance',
    element: <AdminPerformance />,
    visible: false
  },
  {
    name: 'Inventory Management',
    path: '/admin/inventory',
    element: <AdminInventory />,
    visible: false
  },
  {
    name: 'Billing Management',
    path: '/admin/billing',
    element: <AdminBilling />,
    visible: false
  },
  {
    name: 'Chatbot Escalations',
    path: '/admin/chatbot-escalations',
    element: <AdminChatEscalations />,
    visible: false
  },
  {
    name: 'Knowledge Base Management',
    path: '/admin/knowledge-base',
    element: <AdminKnowledgeBase />,
    visible: false
  },
  {
    name: 'Cron Job Monitor',
    path: '/admin/cron-monitor',
    element: <AdminCronMonitor />,
    visible: false
  },
  {
    name: 'Office & Branch Console',
    path: '/admin/offices',
    element: <AdminOffices />,
    visible: false
  },
  {
    name: 'Email Template Settings',
    path: '/admin/email-template-settings',
    element: <AdminEmailTemplateSettings />,
    visible: false
  },
  {
    name: 'Employee Performance',
    path: '/admin/employee-performance',
    element: <EmployeePerformanceDashboard />,
    visible: false
  },
  {
    name: 'Email Analytics',
    path: '/admin/email-analytics',
    element: <EmailAnalyticsDashboard />,
    visible: false
  },
  {
    name: 'Customer Feedback',
    path: '/admin/customer-feedback',
    element: <CustomerFeedbackDashboard />,
    visible: false
  },
  {
    name: 'Notifications',
    path: '/admin/notifications',
    element: <NotificationCenter />,
    visible: false
  },
  {
    name: 'CRM Dashboard',
    path: '/admin/crm',
    element: <CRMDashboard />,
    visible: false
  },
  {
    name: 'Lead Management',
    path: '/admin/crm/leads',
    element: <LeadManagement />,
    visible: false
  },
  {
    name: 'Lead Detail',
    path: '/admin/crm/leads/:id',
    element: <LeadDetail />,
    visible: false
  },
  {
    name: 'Sales Pipeline',
    path: '/admin/crm/pipeline',
    element: <SalesPipeline />,
    visible: false
  },
  {
    name: 'Customer Detail',
    path: '/admin/crm/customers/:id',
    element: <CustomerDetail />,
    visible: false
  },
  {
    name: 'Email Campaigns',
    path: '/admin/crm/campaigns',
    element: <EmailCampaigns />,
    visible: false
  },
  {
    name: 'Call Logs',
    path: '/admin/crm/calls',
    element: <CallLogs />,
    visible: false
  },
  {
    name: 'Meeting Scheduler',
    path: '/admin/crm/meetings',
    element: <MeetingScheduler />,
    visible: false
  },
  {
    name: 'Task Management',
    path: '/admin/crm/tasks',
    element: <TaskManagement />,
    visible: false
  },
  {
    name: 'CRM Advanced Reporting',
    path: '/admin/crm/reports',
    element: <CRMAdvancedReporting />,
    visible: false
  },
  {
    name: 'CRM Analytics Dashboard',
    path: '/admin/crm/analytics',
    element: <CRMAnalyticsDashboard />,
    visible: false
  },
  {
    name: 'Customer Segmentation',
    path: '/admin/crm/segments',
    element: <CustomerSegmentation />,
    visible: false
  },
  {
    name: 'Customer Feedback & Surveys',
    path: '/admin/crm/feedback',
    element: <CustomerFeedbackSurveys />,
    visible: false
  },
  {
    name: 'Customer Reports & Analytics',
    path: '/admin/crm/customer-reports',
    element: <CustomerReportsAnalytics />,
    visible: false
  },
  {
    name: 'CRM Audit Logs',
    path: '/admin/crm/audit-logs',
    element: <CRMAuditLogs />,
    visible: false
  }
];

export default routes;
