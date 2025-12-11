-- Initial schema for tasks and supporting triggers/indexes
create extension if not exists "uuid-ossp";

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  status text not null default 'pending' check (status in ('pending', 'done')),
  description text,
  steps jsonb,
  extra_info jsonb,
  needs_enrichment boolean not null default true,
  ai_last_run_at timestamptz,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists tasks_needs_enrichment_idx on public.tasks(needs_enrichment);

create or replace function public.set_tasks_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tasks_updated_at on public.tasks;

create trigger tasks_updated_at
before update on public.tasks
for each row execute function public.set_tasks_updated_at();

