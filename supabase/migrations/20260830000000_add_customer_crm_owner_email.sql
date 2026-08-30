alter table if exists public.customer_crm_records
  add column if not exists owner_email text not null default '';
