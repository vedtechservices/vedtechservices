export const ticketCategories = ['software', 'hardware', 'network', 'maintenance', 'general'] as const;
export type TicketDraft = { category: string; description: string; name: string; email: string };
export function ticketValidation(value: TicketDraft): string {
  if (!ticketCategories.includes(value.category as (typeof ticketCategories)[number]))
    return 'Choose an issue category.';
  if (
    typeof value.description !== 'string' ||
    value.description.trim().length < 10 ||
    value.description.length > 2000
  )
    return 'Describe the issue in 10–2000 characters.';
  if (typeof value.name !== 'string' || !value.name.trim() || value.name.length > 100)
    return 'Enter a contact name (up to 100 characters).';
  if (
    typeof value.email !== 'string' ||
    value.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())
  )
    return 'Enter a valid contact email.';
  return '';
}
export function ticketPayload(draft: TicketDraft) {
  return {
    category: draft.category,
    description: draft.description.trim(),
    name: draft.name.trim(),
    email: draft.email.trim().toLowerCase(),
  };
}
export type ConfirmedTicket = {
  id: string;
  ticket_number: string;
  status: string;
  category: string;
  created_at: string;
};
// Fail closed: a local brief or an unconfirmed response is never displayed as a submitted ticket.
export function confirmedTicket(value: unknown): value is ConfirmedTicket {
  const t = value as ConfirmedTicket;
  return (
    !!t &&
    typeof t.id === 'string' &&
    /^[a-f0-9-]{36}$/i.test(t.id) &&
    typeof t.ticket_number === 'string' &&
    /^VTS-\d{4}-\d{6,}$/.test(t.ticket_number) &&
    ['pending', 'active', 'resolved'].includes(t.status) &&
    ticketCategories.includes(t.category as (typeof ticketCategories)[number]) &&
    Number.isFinite(Date.parse(t.created_at))
  );
}
