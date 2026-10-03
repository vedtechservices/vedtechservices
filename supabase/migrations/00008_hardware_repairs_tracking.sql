create table hardware_repairs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  ticket_id text,
  device_name text not null,
  serial_number text,
  issue_description text,
  status text default 'received',
  progress_percent integer default 10,
  technician_notes text,
  estimated_completion timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Realtime for these tables
alter publication supabase_realtime add table hardware_repairs;
alter publication supabase_realtime add table support_tickets;
