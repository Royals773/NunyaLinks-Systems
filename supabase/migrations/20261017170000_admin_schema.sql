-- NunyaLink Admin: leads, clients, projects, quotes and invoices.
-- Access model: only users listed in public.admin_users can read or write
-- business data. The anonymous role can only INSERT a new website lead
-- (limited columns) and can never read anything back.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ------------------------------------------------------------ admin users
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'staff' check (role in ('owner', 'staff')),
  full_name text check (char_length(full_name) <= 200),
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create policy "Admins can see their own admin record"
  on public.admin_users for select
  to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid()) and role = 'owner'
  );
$$;

-- ------------------------------------------------------------------ leads
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 1 and 200),
  business_name text check (char_length(business_name) <= 200),
  email text not null check (char_length(email) between 3 and 320),
  phone text check (char_length(phone) <= 50),
  location text check (char_length(location) <= 200),
  contact_method text check (char_length(contact_method) <= 50),
  industry text check (char_length(industry) <= 200),
  employees text check (char_length(employees) <= 50),
  biggest_task text check (char_length(biggest_task) <= 4000),
  hours_per_week text check (char_length(hours_per_week) <= 50),
  message text check (char_length(message) <= 4000),
  source text not null default 'website'
    check (source in ('website', 'referral', 'phone', 'email', 'social', 'other')),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
  notes text check (char_length(notes) <= 20000),
  next_follow_up date
);
alter table public.leads enable row level security;

-- ---------------------------------------------------------------- clients
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 200),
  contact_name text check (char_length(contact_name) <= 200),
  email text check (char_length(email) <= 320),
  phone text check (char_length(phone) <= 50),
  address text check (char_length(address) <= 1000),
  status text not null default 'active' check (status in ('active', 'inactive')),
  notes text check (char_length(notes) <= 20000),
  lead_id uuid references public.leads (id) on delete set null
);
alter table public.clients enable row level security;

alter table public.leads
  add column client_id uuid references public.clients (id) on delete set null;

-- --------------------------------------------------------------- projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  client_id uuid not null references public.clients (id) on delete restrict,
  name text not null check (char_length(name) between 1 and 200),
  type text not null default 'automation'
    check (type in ('automation', 'website', 'software', 'ai_receptionist', 'audit', 'other')),
  status text not null default 'planned'
    check (status in ('planned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  start_date date,
  due_date date,
  value_pence integer check (value_pence >= 0),
  notes text check (char_length(notes) <= 20000)
);
alter table public.projects enable row level security;

create table public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 300),
  done boolean not null default false,
  due_date date
);
alter table public.project_tasks enable row level security;

-- ----------------------------------------------------------------- quotes
create sequence public.quote_number_seq;
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  quote_number text not null unique
    default 'Q-' || lpad(nextval('public.quote_number_seq')::text, 4, '0'),
  client_id uuid references public.clients (id) on delete restrict,
  lead_id uuid references public.leads (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  title text not null check (char_length(title) between 1 and 200),
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'accepted', 'declined', 'expired')),
  issue_date date not null default current_date,
  valid_until date,
  vat_rate numeric(5, 2) not null default 0 check (vat_rate between 0 and 100),
  notes text check (char_length(notes) <= 20000),
  constraint quotes_has_recipient check (client_id is not null or lead_id is not null)
);
alter table public.quotes enable row level security;

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes (id) on delete cascade,
  position integer not null default 0,
  description text not null check (char_length(description) between 1 and 500),
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  unit_price_pence integer not null default 0 check (unit_price_pence >= 0)
);
alter table public.quote_items enable row level security;

-- --------------------------------------------------------------- invoices
create sequence public.invoice_number_seq;
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  invoice_number text not null unique
    default 'INV-' || lpad(nextval('public.invoice_number_seq')::text, 4, '0'),
  client_id uuid not null references public.clients (id) on delete restrict,
  project_id uuid references public.projects (id) on delete set null,
  quote_id uuid references public.quotes (id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'paid', 'void')),
  issue_date date not null default current_date,
  due_date date,
  paid_date date,
  vat_rate numeric(5, 2) not null default 0 check (vat_rate between 0 and 100),
  notes text check (char_length(notes) <= 20000)
);
alter table public.invoices enable row level security;

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  position integer not null default 0,
  description text not null check (char_length(description) between 1 and 500),
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  unit_price_pence integer not null default 0 check (unit_price_pence >= 0)
);
alter table public.invoice_items enable row level security;

-- ---------------------------------------------------------------- indexes
create index leads_status_idx on public.leads (status);
create index leads_created_at_idx on public.leads (created_at desc);
create index leads_client_id_idx on public.leads (client_id);
create index clients_lead_id_idx on public.clients (lead_id);
create index projects_client_id_idx on public.projects (client_id);
create index project_tasks_project_id_idx on public.project_tasks (project_id);
create index quotes_client_id_idx on public.quotes (client_id);
create index quotes_lead_id_idx on public.quotes (lead_id);
create index quotes_project_id_idx on public.quotes (project_id);
create index quote_items_quote_id_idx on public.quote_items (quote_id);
create index invoices_client_id_idx on public.invoices (client_id);
create index invoices_project_id_idx on public.invoices (project_id);
create index invoices_quote_id_idx on public.invoices (quote_id);
create index invoices_status_idx on public.invoices (status);
create index invoice_items_invoice_id_idx on public.invoice_items (invoice_id);

-- ------------------------------------------------------- updated_at hooks
create trigger leads_updated_at before update on public.leads
  for each row execute function public.set_updated_at();
create trigger clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger quotes_updated_at before update on public.quotes
  for each row execute function public.set_updated_at();
create trigger invoices_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------- policies
-- Admins (owner or staff) can read, add and edit; only the owner can delete.
do $$
declare
  t text;
begin
  foreach t in array array[
    'leads', 'clients', 'projects', 'project_tasks',
    'quotes', 'quote_items', 'invoices', 'invoice_items'
  ]
  loop
    execute format(
      'create policy "Admins can read %1$s" on public.%1$I for select to authenticated using ((select public.is_admin()))', t);
    execute format(
      'create policy "Admins can add %1$s" on public.%1$I for insert to authenticated with check ((select public.is_admin()))', t);
    execute format(
      'create policy "Admins can edit %1$s" on public.%1$I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format(
      'create policy "Owner can delete %1$s" on public.%1$I for delete to authenticated using ((select public.is_owner()))', t);
  end loop;
end;
$$;

-- Website visitors (anonymous) can submit a new lead and nothing else.
create policy "Website can submit new leads"
  on public.leads for insert
  to anon
  with check (status = 'new' and source = 'website' and client_id is null);

-- ------------------------------------------------------------------ grants
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant select on public.admin_users to authenticated;
grant select, insert, update, delete on
  public.leads, public.clients, public.projects, public.project_tasks,
  public.quotes, public.quote_items, public.invoices, public.invoice_items
  to authenticated;
grant usage on sequence public.quote_number_seq, public.invoice_number_seq to authenticated;

grant insert (
  full_name, business_name, email, phone, location, contact_method,
  industry, employees, biggest_task, hours_per_week, message
) on public.leads to anon;

revoke execute on function public.is_admin(), public.is_owner(), public.set_updated_at() from public, anon;
grant execute on function public.is_admin(), public.is_owner() to authenticated;
