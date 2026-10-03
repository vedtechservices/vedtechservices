import Home from './views/Home';
import About from './views/About';
import Services from './views/Services';
import SoftwareServices from './views/SoftwareServices';
import HardwareServices from './views/HardwareServices';
import ITSupportServices from './views/ITSupportServices';
import WebDevelopment from './views/WebDevelopment';
import MobileAppDevelopment from './views/MobileAppDevelopment';
import HardwareRepair from './views/HardwareRepair';
import NetworkingSolutions from './views/NetworkingSolutions';
import Industries from './views/Industries';
import EducationalInstitutions from './views/EducationalInstitutions';
import CorporateOffices from './views/CorporateOffices';
import RetailShops from './views/RetailShops';
import Healthcare from './views/Healthcare';
import Manufacturing from './views/Manufacturing';
import StartupsSMEs from './views/StartupsSMEs';
import WhyUs from './views/WhyUs';
import Support from './views/Support';
import Contact from './views/Contact';
import Blog from './views/Blog';
import BlogDetail from './views/BlogDetail';
import Demo from './views/Demo';
import AdminLogin from './views/AdminLogin';
import AdminDashboard from './views/AdminDashboard';
import AdminTickets from './views/AdminTickets';
import AdminReviews from './views/AdminReviews';
import AdminSettings from './views/AdminSettings';
import EngineerManagement from './views/EngineerManagement';
import AMCPlans from './views/AMCPlans';
import CustomerDashboard from './views/CustomerDashboard';
import EngineerDashboard from './views/EngineerDashboard';
import AdminManagement from './views/AdminManagement';
import EmployeeManagement from './views/EmployeeManagement';
import EmployeeLogin from './views/EmployeeLogin';
import EmployeeSignup from './views/EmployeeSignup';
import ActivityLogs from './views/ActivityLogs';
import AccountSettings from './views/AccountSettings';
import AdminAuditLogs from './views/AdminAuditLogs';
import AdminPerformance from './views/AdminPerformance';
import AdminInventory from './views/AdminInventory';
import AdminBilling from './views/AdminBilling';
import AdminChatEscalations from './views/AdminChatEscalations';
import AdminKnowledgeBase from './views/AdminKnowledgeBase';
import AdminCronMonitor from './views/AdminCronMonitor';
import AdminOffices from './views/AdminOffices';
import AdminEmailTemplateSettings from './views/AdminEmailTemplateSettings';
import EmployeePerformanceDashboard from './views/EmployeePerformanceDashboard';
import EmailAnalyticsDashboard from './views/EmailAnalyticsDashboard';
import CustomerFeedbackDashboard from './views/CustomerFeedbackDashboard';
import NotificationCenter from './views/NotificationCenter';
import CRMDashboard from './views/CRMDashboard';
import LeadManagement from './views/LeadManagement';
import LeadDetail from './views/LeadDetail';
import SalesPipeline from './views/SalesPipeline';
import CustomerDetail from './views/CustomerDetail';
import EmailCampaigns from './views/EmailCampaigns';
import CallLogs from './views/CallLogs';
import MeetingScheduler from './views/MeetingScheduler';
import TaskManagement from './views/TaskManagement';
import CRMAdvancedReporting from './views/CRMAdvancedReporting';
import CRMAnalyticsDashboard from './views/CRMAnalyticsDashboard';
import CustomerSegmentation from './views/CustomerSegmentation';
import CustomerFeedbackSurveys from './views/CustomerFeedbackSurveys';
import CustomerReportsAnalytics from './views/CustomerReportsAnalytics';
import CRMAuditLogs from './views/CRMAuditLogs';
import PrivacyPolicy from './views/PrivacyPolicy';
import TermsOfService from './views/TermsOfService';
import type { ReactNode } from 'react';

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
