-- KROS Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- ── Extensions ──────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Worker Profiles (HRM) ──────────────────────────────────────
create table worker_profiles (
  id uuid primary key default uuid_generate_v4(),
  employee_id text unique not null,
  given_name text not null,
  surname text not null,
  ic text,
  passport text,
  dob date,
  gender text,
  nationality text default 'Malaysian',
  phone text,
  email text unique,
  department text,
  position text,
  level text,
  joined date,
  status text default 'Active',
  emergency_name text,
  emergency_relation text,
  emergency_phone text,
  insurance_provider text,
  insurance_policy text,
  insurance_coverage numeric,
  insurance_expiry date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Worker Documents ────────────────────────────────────────────
create table worker_documents (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid references worker_profiles(id) on delete cascade,
  name text not null,
  type text not null,
  status text default 'pending',
  file_url text,
  uploaded_at timestamptz default now()
);

-- ── Assets ──────────────────────────────────────────────────────
create table assets (
  id uuid primary key default uuid_generate_v4(),
  asset_id text unique not null,
  type text not null,
  make text not null,
  model text not null,
  year integer,
  plate text,
  serial text,
  hours numeric,
  km numeric,
  location text,
  status text default 'Working',
  operator text,
  purchase_date date,
  purchase_price numeric,
  loan_provider text,
  loan_start date,
  loan_end date,
  monthly_installment numeric,
  loan_balance numeric,
  insurance_provider text,
  insurance_policy text,
  insurance_expiry date,
  insurance_premium numeric,
  roadtax_expiry date,
  warranty text,
  fuel_consumption numeric,
  last_service date,
  next_service date,
  issue text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Asset Documents ─────────────────────────────────────────────
create table asset_documents (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid references assets(id) on delete cascade,
  name text not null,
  type text not null,
  file_url text,
  uploaded_at timestamptz default now()
);

-- ── Skills / Knowledge Base ─────────────────────────────────────
create table skills (
  id uuid primary key default uuid_generate_v4(),
  skill_id text unique not null,
  module text not null,
  title text not null,
  owner text,
  status text default 'fresh',
  sensitivity text default 'low',
  description text,
  content text,
  last_updated timestamptz default now(),
  created_at timestamptz default now()
);

-- ── Production Data ─────────────────────────────────────────────
create table production_days (
  id uuid primary key default uuid_generate_v4(),
  mine_id text not null,
  date date not null default current_date,
  mineral text,
  total_tonnes numeric default 0,
  ore_tonnes numeric default 0,
  waste_tonnes numeric default 0,
  grade numeric,
  recovery numeric,
  uptime numeric,
  cost_per_tonne numeric,
  downtime_hrs numeric,
  man_hours numeric,
  overtime_hrs numeric,
  created_at timestamptz default now()
);

create table production_shifts (
  id uuid primary key default uuid_generate_v4(),
  production_day_id uuid references production_days(id) on delete cascade,
  shift text not null,
  tonnes numeric default 0,
  ore numeric default 0,
  waste numeric default 0,
  grade numeric,
  downtime_min integer default 0,
  notes text
);

-- ── Equipment Time Usage ────────────────────────────────────────
create table equipment_time (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid references assets(id) on delete cascade,
  date date not null default current_date,
  operating_hrs numeric default 0,
  standby_hrs numeric default 0,
  breakdown_hrs numeric default 0,
  pm_hrs numeric default 0,
  idle_hrs numeric default 0,
  fuel_used numeric default 0
);

-- ── Delays / Events ─────────────────────────────────────────────
create table delay_events (
  id uuid primary key default uuid_generate_v4(),
  date date not null default current_date,
  shift text,
  code text not null,
  description text,
  duration_min integer not null,
  equipment_id text,
  root_cause text,
  created_at timestamptz default now()
);

-- ── Stockpiles ──────────────────────────────────────────────────
create table stockpiles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  area text,
  tonnes numeric default 0,
  grade_fe numeric,
  grade_sio2 numeric,
  target_fe numeric,
  status text default 'active',
  created_at timestamptz default now()
);

create table stockpile_movements (
  id uuid primary key default uuid_generate_v4(),
  stockpile_id uuid references stockpiles(id) on delete cascade,
  date date not null default current_date,
  from_location text,
  to_location text,
  tonnes numeric not null,
  grade numeric,
  type text not null
);

-- ── Grade Control ───────────────────────────────────────────────
create table grade_samples (
  id uuid primary key default uuid_generate_v4(),
  hole_id text not null,
  zone text,
  fe numeric,
  sio2 numeric,
  al2o3 numeric,
  depth integer,
  sampled_at timestamptz default now()
);

create table grade_reconciliation (
  id uuid primary key default uuid_generate_v4(),
  month text not null,
  plan_grade numeric,
  actual_grade numeric,
  model_grade numeric,
  dilution numeric,
  ore_loss numeric,
  tonnes numeric
);

-- ── Blast Records ───────────────────────────────────────────────
create table blast_records (
  id uuid primary key default uuid_generate_v4(),
  blast_id text unique not null,
  date date not null,
  zone text,
  holes integer,
  powder_kg numeric,
  tonnes_blast numeric,
  powder_factor numeric,
  p80 integer,
  vibration numeric,
  vibration_limit numeric default 5.0,
  status text default 'completed',
  created_at timestamptz default now()
);

-- ── Safety Observations ─────────────────────────────────────────
create table safety_observations (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  description text not null,
  location text,
  category text,
  reported_by text,
  date date not null default current_date,
  status text default 'open',
  created_at timestamptz default now()
);

-- ── Training / Competency ───────────────────────────────────────
create table training_modules (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  name text not null,
  category text,
  interval_months integer default 12,
  hours integer,
  critical boolean default false
);

create table training_records (
  id uuid primary key default uuid_generate_v4(),
  worker_id uuid references worker_profiles(id) on delete cascade,
  module_id uuid references training_modules(id) on delete cascade,
  completed_date date,
  expiry_date date,
  status text default 'valid',
  created_at timestamptz default now()
);

-- ── Equipment Health / Predictive Maintenance ───────────────────
create table equipment_health (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid references assets(id) on delete cascade,
  health_score integer,
  trend text,
  risk text,
  recorded_at timestamptz default now()
);

create table predicted_failures (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid references assets(id) on delete cascade,
  component text,
  probability integer,
  timeframe text,
  impact text,
  estimated_cost numeric,
  created_at timestamptz default now()
);

-- ── Environmental Monitoring ────────────────────────────────────
create table environmental_readings (
  id uuid primary key default uuid_generate_v4(),
  station_id text not null,
  station_name text,
  type text not null,
  parameter text not null,
  value numeric not null,
  limit_value numeric,
  unit text,
  status text default 'normal',
  read_at timestamptz default now()
);

-- ── Notifications ───────────────────────────────────────────────
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  module text not null,
  message text not null,
  severity text default 'info',
  read boolean default false,
  created_at timestamptz default now()
);

-- ── Workflows ───────────────────────────────────────────────────
create table workflow_templates (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  label text not null,
  module text,
  steps integer,
  sla text,
  alerts boolean default false
);

create table workflow_instances (
  id uuid primary key default uuid_generate_v4(),
  workflow_code text,
  title text not null,
  assignee text,
  status text default 'pending',
  step text,
  due text,
  created_at timestamptz default now()
);

-- ── Shift Handover ──────────────────────────────────────────────
create table shift_handovers (
  id uuid primary key default uuid_generate_v4(),
  date date not null default current_date,
  outgoing text,
  incoming text,
  sections_completed integer,
  issues integer default 0,
  status text default 'completed',
  created_at timestamptz default now()
);

create table handover_checklist (
  id uuid primary key default uuid_generate_v4(),
  handover_id uuid references shift_handovers(id) on delete cascade,
  section text not null,
  item text not null,
  checked boolean default false
);

-- ── Compliance Calendar ─────────────────────────────────────────
create table compliance_items (
  id uuid primary key default uuid_generate_v4(),
  item text not null,
  due_date date not null,
  status text default 'upcoming',
  authority text,
  category text
);

-- ── Row Level Security ──────────────────────────────────────────
alter table worker_profiles enable row level security;
alter table assets enable row level security;
alter table skills enable row level security;
alter table production_days enable row level security;
alter table stockpiles enable row level security;
alter table safety_observations enable row level security;
alter table training_records enable row level security;
alter table notifications enable row level security;

-- ── RLS Policies ────────────────────────────────────────────────
create policy "Users can read all worker profiles"
  on worker_profiles for select using (true);

create policy "Users can read all assets"
  on assets for select using (true);

create policy "Users can read all skills"
  on skills for select using (true);

create policy "Users can read production data"
  on production_days for select using (true);

create policy "Users can read stockpiles"
  on stockpiles for select using (true);

create policy "Users can read safety observations"
  on safety_observations for select using (true);

create policy "Users can read notifications"
  on notifications for select using (true);

-- ── Indexes ─────────────────────────────────────────────────────
create index idx_worker_department on worker_profiles(department);
create index idx_asset_status on assets(status);
create index idx_asset_type on assets(type);
create index idx_skill_module on skills(module);
create index idx_production_date on production_days(date);
create index idx_production_mine on production_days(mine_id);
create index idx_notification_read on notifications(read);
create index idx_safety_date on safety_observations(date);
create index idx_blast_date on blast_records(date);

-- ── Seed Demo Data ──────────────────────────────────────────────
insert into worker_profiles (employee_id, given_name, surname, ic, passport, phone, email, department, position, level, status, emergency_name, emergency_relation, emergency_phone, insurance_provider, insurance_policy, insurance_coverage, insurance_expiry)
values
  ('EMP-001', 'Ahmad', 'Zulkifli', '810101-01-1234', 'A12345678', '+60 12-345 6789', 'ahmad@kros.my', 'Mining', 'Mine Manager', 'Level 8 — Senior Manager', 'Active', 'Siti Zubaidah', 'Spouse', '+60 12-987 6543', 'GREAT Eastern', 'GE-MN-2024-8871', 500000, '2027-03-01'),
  ('EMP-002', 'Farah', 'Izzati', '850605-01-5678', 'B23456789', '+60 13-456 7890', 'farah@kros.my', 'HSE', 'HSE Manager', 'Level 7 — Manager', 'Active', 'Mohd Asyraf', 'Spouse', '+60 11-234 5678', 'AIA Malaysia', 'AIA-HSE-2023-4421', 350000, '2026-06-15'),
  ('EMP-003', 'Amirul', 'Haziq', '920312-01-9012', 'C34567890', '+60 14-567 8901', 'amirul@kros.my', 'Maintenance', 'Maintenance Technician', 'Level 3 — Senior Technician', 'Active', 'Rosniza Hassan', 'Mother', '+60 16-789 0123', 'GREAT Eastern', 'GE-MT-2021-3322', 150000, '2026-09-01');

insert into assets (asset_id, type, make, model, year, plate, serial, hours, location, status, operator, purchase_date, purchase_price, loan_provider, loan_start, loan_end, monthly_installment, loan_balance, insurance_provider, insurance_policy, insurance_expiry, insurance_premium, roadtax_expiry, warranty, fuel_consumption, last_service, next_service)
values
  ('ASSET-001', 'Excavator', 'Caterpillar', 'CAT 336D2 L', 2021, 'WXX 1234', 'CAT336D2L-123456', 8450, 'West Pit', 'Working', 'Amirul Haziq', '2021-03-15', 1850000, 'Maybank Islamic', '2021-04-01', '2027-04-01', 28450, 485000, 'Zurich', 'ZUR-EX-2025-1122', '2026-03-15', 18500, '2026-03-15', 'Expired', 28.5, '2026-05-20', '2026-06-20'),
  ('ASSET-003', 'Articulated Hauler (Dumper)', 'Volvo', 'A60H', 2022, 'WXX 9012', 'VOLA60H-345678', 6200, 'Haul Road A', 'Working', 'Raj Namasivayam', '2022-08-01', 2800000, 'Maybank Islamic', '2022-09-01', '2028-09-01', 41200, 1250000, 'Zurich', 'ZUR-HT-2025-5566', '2027-08-01', 28000, '2026-08-01', 'Active until Aug 2027', 52.0, '2026-05-18', '2026-06-18');

insert into skills (skill_id, module, title, owner, status, sensitivity, description)
values
  ('ops_sop', 'ops', 'Standard Operating Procedures', 'Ops Superintendent', 'fresh', 'low', 'Drill, blast, load & haul procedures'),
  ('hse_ptw', 'hse', 'Permit-to-Work System', 'HSE Manager', 'fresh', 'medium', '6 PTW types, LOTO procedure, confined space entry'),
  ('maint_breakdown', 'maint', 'Breakdown Response & RCA', 'Maintenance Super.', 'fresh', 'low', 'P1-P4 classification, CMMS work orders, 5-Why RCA'),
  ('fin_royalty', 'fin', 'Royalty & Statutory Payments', 'Finance Manager', 'stale', 'high', 'Malaysian state royalty rates, EPF/SOCSO/HRDF/PCB');

insert into notifications (module, message, severity)
values
  ('License', 'Sungai Lembing mining license expires in 7 days', 'critical'),
  ('Maintenance', 'CR-02 drive bearing failure probability 82% within 3 days', 'critical'),
  ('Training', 'Ahmad Z. — DOSH certification expired 120 days overdue', 'critical'),
  ('Weather', 'Thunderstorms forecast +2 days — postpone blasting', 'warning');
