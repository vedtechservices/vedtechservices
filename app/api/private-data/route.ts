import { NextResponse } from 'next/server';
import { randomBytes, scryptSync } from 'node:crypto';
import { currentAdmin, currentEngineer, reviewDb } from '@/lib/reviewServer';

export const dynamic = 'force-dynamic';

const tables = new Set([
  'admin_users', 'admin_settings', 'admin_notifications', 'admin_audit_logs', 'login_audit_logs',
  'activity_logs', 'crm_audit_logs', 'customers', 'engineers', 'leads', 'support_tickets', 'tickets',
  'service_invoices', 'hardware_repairs', 'inventory_items', 'part_requests', 'customer_notifications',
  'engineer_notifications', 'notifications', 'customer_feedback', 'customer_interactions', 'customer_segments',
  'email_campaigns', 'call_logs', 'meetings', 'tasks', 'report_templates', 'report_history', 'report_schedules',
  'report_delivery_logs', 'email_delivery_logs', 'email_templates', 'email_template_settings', 'sla_settings',
  'sla_email_send_log', 'surveys', 'survey_questions', 'survey_responses', 'survey_email_templates',
  'feedback_reminders', 'feedback_responses', 'notification_rules', 'notification_triggers', 'cron_execution_logs',
  'contact_submissions', 'chatbot_escalations', 'chatbot_ratings', 'knowledge_base_articles',
  'article_suggestion_metrics', 'offices', 'exchange_rates', 'amc_plans', 'amc_subscriptions',
  'email_campaigns', 'customer_notifications', 'chat_sessions', 'sla_settings', 'tickets',
]);

const adminOnlyTables = new Set(['admin_users']);
const superAdminConfigTables = new Set(['admin_settings', 'email_template_settings']);
const supportConfigTables = new Set(['email_templates', 'sla_settings', 'sla_email_send_log']);
const billingTables = new Set(['service_invoices', 'amc_subscriptions', 'amc_plans']);
const engineerTables = new Set(['engineers', 'support_tickets', 'engineer_notifications', 'hardware_repairs', 'part_requests', 'inventory_items', 'customer_feedback']);
const supportAdminTables = new Set(['customers', 'engineers', 'leads', 'support_tickets', 'tickets', 'customer_feedback', 'customer_interactions', 'customer_segments', 'email_campaigns', 'call_logs', 'meetings', 'tasks', 'part_requests', 'hardware_repairs']);
const auditTables = new Set(['activity_logs', 'crm_audit_logs', 'login_audit_logs']);
const crmTables = new Set(['leads', 'customer_segments', 'email_campaigns', 'call_logs', 'meetings', 'tasks', 'customer_interactions']);
const privateRpcs = new Set(['check_expiring_amcs', 'update_ticket_admin', 'add_engineer', 'update_engineer', 'delete_engineer', 'get_office_stats', 'check_customer_amc_status', 'get_or_create_customer']);
const hiddenFields = new Set(['password_hash', 'totp_secret', 'reset_code', 'reset_code_expires']);

type Filter = { op: string; column?: string; value?: unknown; values?: unknown[]; expression?: string };

function sanitize(data: any): any {
  if (Array.isArray(data)) return data.map(sanitize);
  if (!data || typeof data !== 'object') return data;
  const output: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!hiddenFields.has(key)) output[key] = sanitize(value);
  }
  return output;
}

function hashPassword(value: unknown) {
  if (typeof value !== 'string' || value.length < 12 || value.length > 256) throw new Error('Passwords must be between 12 and 256 characters.');
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${scryptSync(value, salt, 64).toString('hex')}`;
}

function hashCredentialFields(table: string, payload: any): any {
  if (!['admin_users', 'engineers'].includes(table) || !payload || typeof payload !== 'object') return payload;
  const convert = (row: any) => {
    if (!row || typeof row !== 'object' || !Object.hasOwn(row, 'password_hash')) return row;
    return { ...row, password_hash: hashPassword(row.password_hash) };
  };
  return Array.isArray(payload) ? payload.map(convert) : convert(payload);
}

function applyFilters(query: any, filters: Filter[]) {
  for (const filter of filters) {
    if (filter.op === 'or' && typeof filter.expression === 'string' && filter.expression.length < 1000) query = query.or(filter.expression);
    else if (filter.op === 'in' && filter.column && Array.isArray(filter.values)) query = query.in(filter.column, filter.values);
    else if (filter.op === 'not' && filter.column && typeof filter.values?.[0] === 'string') query = query.not(filter.column, filter.values[0], filter.value);
    else if (filter.column && ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'contains', 'match'].includes(filter.op)) {
      query = filter.op === 'match' ? query.match(filter.value) : query[filter.op](filter.column, filter.value);
    }
  }
  return query;
}

function engineerOwnScope(query: any, table: string, engineer: { id: string }) {
  if (table === 'engineers') return query.eq('id', engineer.id);
  if (table === 'support_tickets') return query.eq('engineer_id', engineer.id);
  if (table === 'engineer_notifications' || table === 'part_requests') return query.eq('engineer_id', engineer.id);
  if (table === 'hardware_repairs') return query.eq('assigned_engineer_id', engineer.id);
  if (table === 'inventory_items') return query;
  return query;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = reviewDb();
    const admin = await currentAdmin();
    const engineer = admin ? null : await currentEngineer();
    let customer: { id: string; email: string } | null = null;
    if (!admin && !engineer) {
      const bearer = request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
      if (bearer) {
        const { data: authData } = await db.auth.getUser(bearer);
        const verifiedEmail = authData.user?.email_confirmed_at ? authData.user.email?.toLowerCase() : null;
        if (verifiedEmail) {
          const { data } = await db.from('customers').select('id,email').ilike('email', verifiedEmail).maybeSingle();
          if (data) customer = { id: data.id, email: data.email };
        }
      }
    }
    if (!admin && !engineer && !customer) return NextResponse.json({ data: null, error: { message: 'Authentication required.' } }, { status: 401 });

    if (body.kind === 'rpc') {
      if (!admin || typeof body.name !== 'string' || !privateRpcs.has(body.name)) return NextResponse.json({ data: null, error: { message: 'Not authorized.' } }, { status: 403 });
      const supportRpc = new Set(['update_ticket_admin', 'add_engineer', 'update_engineer', 'delete_engineer']);
      const billingRpc = new Set(['check_expiring_amcs', 'check_customer_amc_status']);
      if (supportRpc.has(body.name) && !['super_admin', 'support_admin'].includes(admin.role)) return NextResponse.json({ data: null, error: { message: 'Support administrator access required.' } }, { status: 403 });
      if (billingRpc.has(body.name) && !['super_admin', 'billing_admin'].includes(admin.role)) return NextResponse.json({ data: null, error: { message: 'Billing administrator access required.' } }, { status: 403 });
      const { data, error } = await db.rpc(body.name as any, body.args || {});
      return NextResponse.json({ data, error: error ? { message: error.message } : null });
    }

    const { table, action, columns, payload, filters = [], orders = [], limit, single } = body;
    if (typeof table !== 'string' || !tables.has(table) || !['select', 'insert', 'update', 'delete', 'upsert'].includes(action)) {
      return NextResponse.json({ data: null, error: { message: 'Unsupported data operation.' } }, { status: 400 });
    }
    const selfAdminSettingsUpdate = table === 'admin_users' && action === 'update' && admin &&
      payload && typeof payload === 'object' && !Array.isArray(payload) &&
      Object.keys(payload).every(key => ['totp_secret', 'totp_enabled', 'updated_at'].includes(key));
    if (adminOnlyTables.has(table) && (!admin || (admin.role !== 'super_admin' && action !== 'select' && !selfAdminSettingsUpdate))) {
      return NextResponse.json({ data: null, error: { message: 'Super administrator access required.' } }, { status: 403 });
    }
    if (superAdminConfigTables.has(table) && admin?.role !== 'super_admin') {
      return NextResponse.json({ data: null, error: { message: 'Super administrator access required.' } }, { status: 403 });
    }
    if (supportConfigTables.has(table) && !['super_admin', 'support_admin'].includes(admin?.role || '')) {
      return NextResponse.json({ data: null, error: { message: 'Support administrator access required.' } }, { status: 403 });
    }
    if (billingTables.has(table) && !['super_admin', 'billing_admin'].includes(admin?.role || '')) {
      return NextResponse.json({ data: null, error: { message: 'Billing administrator access required.' } }, { status: 403 });
    }
    if (admin && table === 'service_invoices' && !['super_admin', 'billing_admin'].includes(admin.role)) {
      return NextResponse.json({ data: null, error: { message: 'Billing administrator access required.' } }, { status: 403 });
    }
    if (admin && supportAdminTables.has(table) && !['super_admin', 'support_admin'].includes(admin.role)) {
      return NextResponse.json({ data: null, error: { message: 'Support administrator access required.' } }, { status: 403 });
    }
    if (admin && auditTables.has(table) && admin.role !== 'super_admin') {
      return NextResponse.json({ data: null, error: { message: 'Super administrator access required.' } }, { status: 403 });
    }
    if (engineer && (!engineerTables.has(table) || (table === 'engineers' && action !== 'select') || (table === 'inventory_items' && action !== 'select') || (table === 'customer_feedback' && action !== 'select'))) {
      return NextResponse.json({ data: null, error: { message: 'Not authorized for this operation.' } }, { status: 403 });
    }
    const customerTables = new Set(['customers', 'support_tickets', 'customer_notifications', 'service_invoices', 'hardware_repairs', 'amc_subscriptions', 'customer_feedback']);
    const customerFeedbackInsert = customer && table === 'customer_feedback' && action === 'insert';
    if (customer && (!customerTables.has(table) || action === 'delete' || (action === 'insert' && !customerFeedbackInsert))) {
      return NextResponse.json({ data: null, error: { message: 'Not authorized for this operation.' } }, { status: 403 });
    }
    if (customer && action === 'update' && (table !== 'customer_notifications' || !payload || typeof payload !== 'object' || Array.isArray(payload) || Object.keys(payload).some(key => key !== 'is_read'))) {
      return NextResponse.json({ data: null, error: { message: 'This customer update is not permitted.' } }, { status: 403 });
    }
    if (table === 'admin_users' && engineer) return NextResponse.json({ data: null, error: { message: 'Not authorized.' } }, { status: 403 });
    if (['update', 'delete'].includes(action) && (!Array.isArray(filters) || filters.length === 0)) {
      return NextResponse.json({ data: null, error: { message: 'Updates and deletes require a record filter.' } }, { status: 400 });
    }

    let safePayload = hashCredentialFields(table, payload);
    if (customerFeedbackInsert) {
      const rows = Array.isArray(safePayload) ? safePayload : [safePayload];
      if (rows.length !== 1 || !rows[0] || typeof rows[0].ticket_id !== 'string' || !Number.isInteger(rows[0].rating) || rows[0].rating < 1 || rows[0].rating > 5) {
        return NextResponse.json({ data: null, error: { message: 'Invalid feedback.' } }, { status: 400 });
      }
      const { data: ticket } = await db.from('support_tickets').select('id').eq('ticket_id', rows[0].ticket_id).ilike('email', customer!.email).maybeSingle();
      if (!ticket) return NextResponse.json({ data: null, error: { message: 'Ticket not found for this account.' } }, { status: 403 });
      safePayload = { ...rows[0], customer_id: customer!.id, employee_id: null };
    }
    if (engineer && action === 'insert') {
      const bindEngineer = (row: any) => ({ ...row, engineer_id: engineer.id });
      safePayload = Array.isArray(safePayload) ? safePayload.map(bindEngineer) : bindEngineer(safePayload);
    }
    let query: any = (db.from(table as any) as any);
    if (action === 'select') query = query.select(typeof columns === 'string' ? columns.slice(0, 2000) : '*');
    else if (action === 'insert') query = query.insert(safePayload);
    else if (action === 'upsert') query = query.upsert(safePayload);
    else if (action === 'update') query = query.update(safePayload);
    else query = query.delete();

    const safeFilters = Array.isArray(filters) ? filters.slice(0, 100) : [];
    if (table === 'admin_users' && admin?.role !== 'super_admin') safeFilters.push({ op: 'eq', column: 'id', value: admin?.id });
    query = applyFilters(query, safeFilters);
    if (engineer) query = engineerOwnScope(query, table, engineer);
    if (customer) {
      if (table === 'customers') query = query.eq('id', customer.id);
      else if (table === 'support_tickets') query = query.ilike('email', customer.email);
      else query = query.eq('customer_id', customer.id);
    }
    if (engineer && table === 'customer_feedback') {
      const { data: assignments } = await db.from('support_tickets').select('ticket_id').eq('engineer_id', engineer.id).limit(500);
      const assignedTicketIds = (assignments || []).map(ticket => ticket.ticket_id).filter(Boolean);
      if (!assignedTicketIds.length) return NextResponse.json({ data: [], error: null });
      query = query.in('ticket_id', assignedTicketIds);
    }
    if (engineer && action === 'update') {
      const allowedFields: Record<string, string[]> = {
        support_tickets: ['status', 'notes', 'updated_at', 'resolved_at', 'first_response_at'],
        engineer_notifications: ['is_read'],
        hardware_repairs: ['status', 'progress_percent', 'technician_notes', 'estimated_completion', 'updated_at'],
      };
      const allowed = allowedFields[table] || [];
      if (!payload || typeof payload !== 'object' || Array.isArray(payload) || Object.keys(payload).some(key => !allowed.includes(key))) {
        return NextResponse.json({ data: null, error: { message: 'This employee update is not permitted.' } }, { status: 403 });
      }
    }
    for (const order of Array.isArray(orders) ? orders.slice(0, 10) : []) {
      if (typeof order?.column === 'string') query = query.order(order.column, { ascending: order.ascending !== false, nullsFirst: order.nullsFirst });
    }
    if (Number.isInteger(limit) && limit >= 0 && limit <= 1000) query = query.limit(limit);
    if (Number.isInteger(body.offset) && body.offset >= 0 && body.offset <= 100000) query = query.range(body.offset, body.offset + Math.max(0, (limit || 100) - 1));
    if (action !== 'select' && body.returning) query = query.select(typeof columns === 'string' ? columns : '*');
    if (single === 'single') query = query.single();
    else if (single === 'maybeSingle') query = query.maybeSingle();

    const { data, error, count, status, statusText } = await query;
    if (!error && admin && crmTables.has(table) && action !== 'select') {
      const idFilter = safeFilters.find(filter => filter.op === 'eq' && filter.column === 'id')?.value;
      const createdRow = Array.isArray(data) ? data[0] : data;
      const recordId = idFilter || createdRow?.id;
      await db.from('crm_audit_logs').insert({
        table_name: table,
        record_id: recordId ? String(recordId) : null,
        action: action === 'insert' || action === 'upsert' ? 'CREATE' : action.toUpperCase(),
        admin_id: admin.id,
        admin_email: admin.email,
        admin_role: admin.role,
      });
    }
    return NextResponse.json({ data: sanitize(data), error: error ? { message: error.message, code: error.code, details: error.details, hint: error.hint } : null, count, status, statusText });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed.';
    return NextResponse.json({ data: null, error: { message } }, { status: 400 });
  }
}
