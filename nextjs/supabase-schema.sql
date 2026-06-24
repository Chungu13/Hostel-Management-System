-- Hostel Management System (Malo) - Supabase Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Properties (multi-tenant root)
create table properties (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text not null,
  property_type text not null default 'Hostel',
  admin_id uuid,
  created_at timestamptz default now()
);

-- Users (extends Supabase auth.users)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  ic text,
  address text,
  profile_image text,
  role text not null default 'Resident', -- Resident | Security Staff | Managing Staff
  property_id uuid references properties(id),
  is_onboarded boolean default false,
  is_approved boolean default false,
  history_cleared_at timestamptz,
  created_at timestamptz default now()
);

-- Residents
create table residents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  ic text,
  gender text,
  address text,
  room text,
  approved boolean default false,
  property_id uuid references properties(id),
  created_at timestamptz default now()
);

-- Security Staff
create table security_staff (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  ic text,
  gender text,
  address text,
  approved boolean default true,
  on_duty boolean default false,
  property_id uuid references properties(id),
  created_at timestamptz default now()
);

-- Visit Requests (QR passes)
create table visit_requests (
  id uuid primary key default uuid_generate_v4(),
  resident_id uuid references residents(id) on delete cascade,
  resident_name text,
  visitor_name text not null,
  visit_code text unique not null,
  request_date timestamptz default now(),
  visit_date date not null,
  visit_time time,
  purpose text,
  status text not null default 'Approved', -- Approved | Rejected | Pending | Expired | Verified
  property_id uuid references properties(id)
);

-- Visitor Details (logged at gate after scan)
create table visitor_details (
  id uuid primary key default uuid_generate_v4(),
  visit_request_id uuid references visit_requests(id) on delete cascade,
  email text,
  ic text,
  visitor_name text,
  phone text,
  gender text,
  address text,
  logged_at timestamptz default now()
);

-- Verified Visitors (audit log)
create table verified_visitors (
  id uuid primary key default uuid_generate_v4(),
  security_staff_id uuid references security_staff(id),
  resident_name text,
  visit_code text,
  status text default 'Verified',
  verified_at timestamptz default now(),
  property_id uuid references properties(id)
);

-- Notices
create table notices (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties(id),
  title text not null,
  content text not null,
  importance text default 'Low', -- Low | Medium | High
  updated_at timestamptz default now()
);

-- Row Level Security
alter table users enable row level security;
alter table properties enable row level security;
alter table residents enable row level security;
alter table security_staff enable row level security;
alter table visit_requests enable row level security;
alter table visitor_details enable row level security;
alter table verified_visitors enable row level security;
alter table notices enable row level security;

-- Users can read/update their own record
create policy "users_own" on users for all using (auth.uid() = id);

-- Properties readable by anyone authenticated
create policy "properties_read" on properties for select using (auth.role() = 'authenticated');

-- Allow managing staff to create and update their own property
create policy "properties_insert" on properties for insert
  with check (auth.uid() = admin_id);

create policy "properties_manage" on properties for update
  using (admin_id = auth.uid())
  with check (admin_id = auth.uid());

create policy "properties_delete" on properties for delete
  using (admin_id = auth.uid());

-- Residents: visible within same property
create policy "residents_property" on residents for all
  using (property_id = (select property_id from users where id = auth.uid()));

-- Security Staff: visible within same property
create policy "staff_property" on security_staff for all
  using (property_id = (select property_id from users where id = auth.uid()));

-- Visit Requests: residents see own, security/admin see property-wide
create policy "visits_read" on visit_requests for select
  using (
    property_id = (select property_id from users where id = auth.uid())
  );
create policy "visits_insert" on visit_requests for insert
  with check (property_id = (select property_id from users where id = auth.uid()));
create policy "visits_update" on visit_requests for update
  using (property_id = (select property_id from users where id = auth.uid()));
create policy "visits_delete" on visit_requests for delete
  using (resident_id in (select id from residents where user_id = auth.uid()));

-- Public pass lookup (no auth needed)
create policy "visits_public" on visit_requests for select using (true);

-- Visitor details: property scoped
create policy "visitor_details_property" on visitor_details for all
  using (visit_request_id in (
    select id from visit_requests where property_id = (select property_id from users where id = auth.uid())
  ));

-- Verified visitors: property scoped
create policy "verified_property" on verified_visitors for all
  using (property_id = (select property_id from users where id = auth.uid()));

-- Notices: property scoped
create policy "notices_read" on notices for select
  using (property_id = (select property_id from users where id = auth.uid()));
create policy "notices_manage" on notices for all
  using (property_id in (
    select p.id from properties p
    join users u on u.id = auth.uid()
    where u.role = 'Managing Staff' and u.property_id = p.id
  ));

-- Function to generate 8-char visit code
create or replace function generate_visit_code()
returns text language sql as $$
  select upper(substring(md5(random()::text) from 1 for 8));
$$;
