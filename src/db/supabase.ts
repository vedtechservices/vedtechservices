import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  );
}

const rawSupabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);

const privateTables = new Set([
  'admin_users', 'admin_settings', 'admin_notifications', 'login_audit_logs', 'activity_logs', 'crm_audit_logs',
  'customers', 'engineers', 'leads', 'support_tickets', 'tickets', 'service_invoices', 'hardware_repairs',
  'inventory_items', 'part_requests', 'customer_notifications', 'engineer_notifications', 'notifications',
  'customer_feedback', 'customer_interactions', 'customer_segments', 'email_campaigns', 'call_logs', 'meetings', 'tasks',
  'report_templates', 'report_history', 'report_schedules', 'report_delivery_logs', 'email_delivery_logs',
  'email_templates', 'email_template_settings', 'sla_settings', 'sla_email_send_log', 'surveys', 'survey_questions',
  'survey_responses', 'survey_email_templates', 'feedback_reminders', 'feedback_responses', 'notification_rules',
  'notification_triggers', 'cron_execution_logs', 'contact_submissions', 'chatbot_escalations', 'chatbot_ratings',
  'knowledge_base_articles', 'article_suggestion_metrics', 'offices', 'exchange_rates', 'amc_plans', 'amc_subscriptions',
]);
const privateRpcs = new Set([
  'check_expiring_amcs', 'update_ticket_admin', 'add_engineer', 'update_engineer', 'delete_engineer',
  'get_office_stats', 'check_customer_amc_status', 'get_or_create_customer',
]);
const privateFunctions = new Set([
  'ai-kb-assistant', 'preview-sla-email', 'monitor-slas', 'send-admin-reply', 'send-weekly-report',
  'generate-scheduled-reports', 'calculate-engagement-scores', 'update-exchange-rates',
]);

type QueryFilter = { op: string; column?: string; value?: unknown; values?: unknown[]; expression?: string };

class ProtectedQuery implements PromiseLike<any> {
  private action = 'select';
  private columns: string | null = null;
  private payload: unknown;
  private filters: QueryFilter[] = [];
  private orders: Array<{ column: string; ascending?: boolean; nullsFirst?: boolean }> = [];
  private maxRows?: number;
  private offset?: number;
  private singleMode?: 'single' | 'maybeSingle';
  private returning = false;

  constructor(private table: string) {}

  select(columns = '*') { if (this.action === 'select') this.columns = columns; else { this.columns = columns; this.returning = true; } return this; }
  insert(payload: unknown) { this.action = 'insert'; this.payload = payload; return this; }
  upsert(payload: unknown) { this.action = 'upsert'; this.payload = payload; return this; }
  update(payload: unknown) { this.action = 'update'; this.payload = payload; return this; }
  delete() { this.action = 'delete'; return this; }
  eq(column: string, value: unknown) { this.filters.push({ op: 'eq', column, value }); return this; }
  neq(column: string, value: unknown) { this.filters.push({ op: 'neq', column, value }); return this; }
  gt(column: string, value: unknown) { this.filters.push({ op: 'gt', column, value }); return this; }
  gte(column: string, value: unknown) { this.filters.push({ op: 'gte', column, value }); return this; }
  lt(column: string, value: unknown) { this.filters.push({ op: 'lt', column, value }); return this; }
  lte(column: string, value: unknown) { this.filters.push({ op: 'lte', column, value }); return this; }
  like(column: string, value: unknown) { this.filters.push({ op: 'like', column, value }); return this; }
  ilike(column: string, value: unknown) { this.filters.push({ op: 'ilike', column, value }); return this; }
  is(column: string, value: unknown) { this.filters.push({ op: 'is', column, value }); return this; }
  contains(column: string, value: unknown) { this.filters.push({ op: 'contains', column, value }); return this; }
  in(column: string, values: unknown[]) { this.filters.push({ op: 'in', column, values }); return this; }
  not(column: string, operator: string, value: unknown) { this.filters.push({ op: 'not', column, value, values: [operator] }); return this; }
  match(value: Record<string, unknown>) { this.filters.push({ op: 'match', value }); return this; }
  or(expression: string) { this.filters.push({ op: 'or', expression }); return this; }
  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) { this.orders.push({ column, ...options }); return this; }
  limit(count: number) { this.maxRows = count; return this; }
  range(from: number, to: number) { this.offset = from; this.maxRows = Math.max(0, to - from + 1); return this; }
  single() { this.singleMode = 'single'; return this; }
  maybeSingle() { this.singleMode = 'maybeSingle'; return this; }

  private async execute() {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    try {
      const { data } = await rawSupabase.auth.getSession();
      if (data.session?.access_token) headers.set('Authorization', `Bearer ${data.session.access_token}`);
    } catch { /* admin/engineer sessions use the HttpOnly application cookie */ }
    const response = await fetch('/api/private-data', {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify({ table: this.table, action: this.action, columns: this.columns, payload: this.payload, filters: this.filters, orders: this.orders, limit: this.maxRows, offset: this.offset, single: this.singleMode, returning: this.returning }),
    });
    try { return await response.json(); }
    catch { return { data: null, error: { message: 'The protected data request failed.' }, status: response.status }; }
  }

  then<TResult1 = any, TResult2 = never>(onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

const privateRpcResult = async (name: string, args?: Record<string, unknown>) => {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  try {
    const { data } = await rawSupabase.auth.getSession();
    if (data.session?.access_token) headers.set('Authorization', `Bearer ${data.session.access_token}`);
  } catch { /* admin/engineer sessions use the HttpOnly application cookie */ }
  const response = await fetch('/api/private-data', {
    method: 'POST', headers, credentials: 'same-origin', body: JSON.stringify({ kind: 'rpc', name, args }),
  });
  try { return await response.json(); } catch { return { data: null, error: { message: 'The protected RPC failed.' } }; }
};

const privateFunctionResult = async (name: string, body?: unknown) => {
  const response = await fetch('/api/private-functions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
    body: JSON.stringify({ name, body }),
  });
  const result = await response.json().catch(() => ({ data: null, error: { message: 'The protected function failed.' } }));
  return response.ok ? result : { data: null, error: { message: result.error?.message || 'Not authorized.' } };
};

class ProtectedRpc implements PromiseLike<any> {
  constructor(private name: string, private args?: Record<string, unknown>) {}
  then<TResult1 = any, TResult2 = never>(onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): PromiseLike<TResult1 | TResult2> {
    return privateRpcResult(this.name, this.args).then(onfulfilled, onrejected);
  }
}

export const supabase = new Proxy(rawSupabase, {
  get(target, property, receiver) {
    if (property === 'from') return (table: string) => privateTables.has(table) ? new ProtectedQuery(table) as any : target.from(table as any);
    if (property === 'rpc') return (name: string, args?: Record<string, unknown>) => privateRpcs.has(name) ? new ProtectedRpc(name, args) as any : target.rpc(name as any, args as any);
    if (property === 'functions') {
      const funcs = Reflect.get(target, property, target);
      return new Proxy(funcs, {
        get(functionTarget, functionProperty) {
          if (functionProperty === 'invoke') return (name: string, options?: { body?: unknown }) => privateFunctions.has(name) ? privateFunctionResult(name, options?.body) as any : functionTarget.invoke(name, options as any);
          const value = Reflect.get(functionTarget, functionProperty, functionTarget);
          return typeof value === 'function' ? value.bind(functionTarget) : value;
        },
      });
    }
    const value = Reflect.get(target, property, receiver);
    return typeof value === 'function' ? value.bind(target) : value;
  },
}) as typeof rawSupabase;

// Use explicitly for browser features whose database policies are intentionally public.
export const supabasePublic = supabase;
