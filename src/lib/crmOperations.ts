
export type CrmTable = 'leads' | 'meetings' | 'call_logs' | 'tasks' | 'email_campaigns';
export type CrmAction = 'CREATE' | 'UPDATE' | 'DELETE';

interface CrmOperationOptions {
  table: CrmTable;
  action: CrmAction;
  data?: Record<string, unknown>;
  record_id?: string;
}

interface CrmOperationResult {
  success: boolean;
  id?: string;
  errors?: string[];
  error?: string;
}

/**
 * Performs a validated + audited CRM operation via the Edge Function.
 * Returns { success, id } on success, { success: false, errors } on validation failure.
 */
export async function crmOperation(opts: CrmOperationOptions): Promise<CrmOperationResult> {
  const response = await fetch('/api/private-data', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
    body: JSON.stringify({
      table: opts.table,
      action: opts.action === 'CREATE' ? 'insert' : opts.action.toLowerCase(),
      payload: opts.data,
      filters: opts.record_id ? [{ op: 'eq', column: 'id', value: opts.record_id }] : [],
      columns: 'id', returning: opts.action === 'CREATE', single: opts.action === 'CREATE' ? 'maybeSingle' : undefined,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.error) return { success: false, error: result.error?.message || 'Operation failed.' };
  const row = Array.isArray(result.data) ? result.data[0] : result.data;
  return { success: true, id: row?.id };
}

// ─── Client-side pre-validation helpers (instant feedback before API call) ───

export function validateEmailFormat(email: string): string | null {
  if (!email.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Email address is not valid.';
  return null;
}

export function validatePhoneFormat(phone: string): string | null {
  if (!phone) return null; // phone is optional
  const cleaned = phone.replace(/[\s\-().]/g, '');
  if (!/^\+?[0-9]{7,15}$/.test(cleaned)) return 'Phone number format is invalid (e.g. +91 9876543210).';
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value?.trim()) return `${fieldName} is required.`;
  return null;
}
