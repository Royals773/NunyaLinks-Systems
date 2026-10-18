-- Proposals, contracts, editable templates and business details.

-- --------------------------------------------------------- business details
create table public.business_settings (
  id boolean primary key default true check (id),
  updated_at timestamptz not null default now(),
  trading_name text check (char_length(trading_name) <= 200),
  legal_name text check (char_length(legal_name) <= 200),
  company_number text check (char_length(company_number) <= 50),
  address text check (char_length(address) <= 1000),
  email text check (char_length(email) <= 320),
  phone text check (char_length(phone) <= 50),
  website text check (char_length(website) <= 200),
  vat_number text check (char_length(vat_number) <= 50),
  signatory_name text check (char_length(signatory_name) <= 200),
  signatory_title text check (char_length(signatory_title) <= 200),
  payment_terms text check (char_length(payment_terms) <= 2000),
  bank_details text check (char_length(bank_details) <= 2000)
);
alter table public.business_settings enable row level security;
create trigger business_settings_updated_at before update on public.business_settings
  for each row execute function public.set_updated_at();

create policy "Admins can read business settings" on public.business_settings
  for select to authenticated using ((select public.is_admin()));
create policy "Owner can edit business settings" on public.business_settings
  for update to authenticated using ((select public.is_owner())) with check ((select public.is_owner()));

insert into public.business_settings (trading_name, email, website, payment_terms)
values (
  'NunyaLink Systems',
  'enquiries@nunyalinksystems.com',
  'www.nunyalinksystems.com',
  '50% deposit on signing, 50% on launch. Invoices are payable within 14 days of the invoice date.'
);

-- -------------------------------------------------------------- templates
create table public.document_templates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null check (kind in ('proposal', 'contract')),
  name text not null check (char_length(name) between 1 and 200),
  body text not null default '' check (char_length(body) <= 200000),
  is_default boolean not null default false
);
alter table public.document_templates enable row level security;
create unique index document_templates_one_default_per_kind
  on public.document_templates (kind) where is_default;
create trigger document_templates_updated_at before update on public.document_templates
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------- documents
create sequence public.proposal_number_seq;
create sequence public.contract_number_seq;

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null check (kind in ('proposal', 'contract')),
  doc_number text not null unique,
  title text not null check (char_length(title) between 1 and 200),
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'accepted', 'signed', 'declined', 'cancelled')),
  client_id uuid references public.clients (id) on delete restrict,
  lead_id uuid references public.leads (id) on delete set null,
  quote_id uuid references public.quotes (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  template_id uuid references public.document_templates (id) on delete set null,
  body text not null default '' check (char_length(body) <= 200000),
  constraint documents_has_recipient check (client_id is not null or lead_id is not null)
);
alter table public.documents enable row level security;
create index documents_kind_idx on public.documents (kind);
create index documents_client_id_idx on public.documents (client_id);
create index documents_lead_id_idx on public.documents (lead_id);
create index documents_quote_id_idx on public.documents (quote_id);
create index documents_project_id_idx on public.documents (project_id);
create index documents_template_id_idx on public.documents (template_id);
create trigger documents_updated_at before update on public.documents
  for each row execute function public.set_updated_at();

create or replace function public.set_document_number()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.doc_number is null or new.doc_number = '' then
    if new.kind = 'proposal' then
      new.doc_number := 'P-' || lpad(nextval('public.proposal_number_seq')::text, 4, '0');
    else
      new.doc_number := 'C-' || lpad(nextval('public.contract_number_seq')::text, 4, '0');
    end if;
  end if;
  return new;
end;
$$;
create trigger documents_set_number before insert on public.documents
  for each row execute function public.set_document_number();

-- --------------------------------------------------------------- policies
do $$
declare
  t text;
begin
  foreach t in array array['document_templates', 'documents']
  loop
    execute format('create policy "Admins can read %1$s" on public.%1$I for select to authenticated using ((select public.is_admin()))', t);
    execute format('create policy "Admins can add %1$s" on public.%1$I for insert to authenticated with check ((select public.is_admin()))', t);
    execute format('create policy "Admins can edit %1$s" on public.%1$I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('create policy "Owner can delete %1$s" on public.%1$I for delete to authenticated using ((select public.is_owner()))', t);
  end loop;
end;
$$;

grant select, update on public.business_settings to authenticated;
grant select, insert, update, delete on public.document_templates, public.documents to authenticated;
grant usage on sequence public.proposal_number_seq, public.contract_number_seq to authenticated;
revoke execute on function public.set_document_number() from public, anon;

-- Default templates are installed from the app (lib/admin/default-templates.ts).

-- Tighten default privileges Supabase grants on new tables.
revoke all on public.business_settings, public.document_templates, public.documents from anon, authenticated;
revoke all on sequence public.proposal_number_seq, public.contract_number_seq from anon;
grant select, update on public.business_settings to authenticated;
grant select, insert, update, delete on public.document_templates, public.documents to authenticated;
